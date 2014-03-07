/**
 * Promise.js
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if (typeof exports ==='object') {
        factory(require, exports, module);
    }
    else {
        var _module = { exports: {} };
        factory(null, root, _module);
        root.Promise = _module.exports;
    }

}(this, function (require, exports, module) {
    "use strict";

    Array.prototype.forEach || (Array.prototype.forEach = function (callback) {
        var i, length = this.length;
        for (i = 0; i < length; i++) {
            callback(this[i], i, this);
        }
    });

    module.exports = Promise;

    function Promise (resolver) {
        if (typeof resolver !== 'function') {
            throw new TypeError();
        }

        if (!(this instanceof Promise)) {
            return new Promise(resolver);
        }

        var value, queue = [], promise = this;

        this.invoke = function (onResolve, onReject, resolve) {
            queue ? queue.push(callback) : nextTick(callback);

            function callback () {
                value.invoke(onResolve, onReject, resolve);
            }
        };

        try {
            resolver(resolve, reject);
        } catch (e) {
            reject(e);
        }

        function resolve (x) {
            if (!queue) return;

            var handlers = queue;
            queue = undefined;

            // 保存当前处理的数据的 promise 转换的引用，供链式调用使用
            value = transform.call(promise, x);

            nextTick(function () {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i]();
                }
            });
        }

        function reject (reason) {
            resolve(make(reason, true));
        }
    }

    Promise.cast = cast;
    Promise.resolve = resolve;
    Promise.reject = reject;
    Promise.all = all;

    Promise.prototype.then = function (onResolve, onReject) {
        var promise = this;

        return new Promise(function (resolve) {
            promise.invoke(onResolve, onReject, resolve);
        });
    };

    Promise.prototype['catch'] = function (onReject) {
        return this.then(0, onReject);
    };

    // alias
    Promise.prototype.done = function (onResolve) {
        return this.then(onResolve);
    };

    Promise.prototype.fail = Promise.prototype['catch'];

    // 处理各种情况的普通值，转换为 promise 对象
    function transform (value) {
        var promise = this;

        if (value instanceof Promise) return value;

        if (value === Object(value) && typeof value.then === 'function') {
            return new Promise(function (resolve, reject) {
                value.then(resolve, reject);
            });
        }

        // 如果是 `reject` 则已经提前通过 `reject` 处理
        return make(value);
    }

    // 普通值转换为完成态的 promise 对象
    function make (value, status) {
        var index = status ? 1 : 0;

        var promise = new Promise(function (resolve, reject) {
            var fn = arguments[index];
            nextTick(function () {
                fn(value);
            });
        });

        promise.invoke = function (onResolve, onReject, resolve) {
            var callback = arguments[index];
            resolve(typeof callback === 'function' ? callback(value) : promise);
        };

        return promise;
    }

    function cast (x) {
        if (x === Object(x) && x.constructor === Promise && (x instanceof Promise)) return x;
        return new Promise(function (resolve) {
            resolve(x);
        });
    }

    function resolve (x) {
        return new Promise(function (resolve) {
            resolve(x);
        });
    }

    function reject (x) {
        return new Promise(function (_, reject) {
            reject(x);
        });
    }

    function all (array) {
        return new Promise(function (resolve, reject) {
            if (Object.prototype.toString.call(array) !== '[object Array]') {
                return resolve(array);
            }

            var total = array.length;
            var result = [];

            if (!total) {
                return resolve(result);
            }

            array.forEach(function (item, index) {
                var promise = cast(item);
                promise.then(function (value) {
                    result[index] = value;
                    if (!--total) resolve(result);
                }, reject);
            });
        });
    }

    function nextTick (fn) {
        if (typeof setImmediate === 'function') {
            return setImmediate(fn);
        }

        if (typeof process === 'object' && {}.toString.call(process) === '[object process]') {
            return process.nextTick(fn);
        }

        setTimeout(fn, 0);
    }
}));
