if (typeof require !== 'undefined') {
    var assert = require('assert');
    var Promise = require('../lib/promise.js');
}

"use strict";

describe ('基础功能', function () {
    it ('Promise() 支持接收函数参数', function () {
        assert.throws(function () {
            var promise = new Promise();
        }, TypeError);
    });

    it ('Promise() 实例化时必须使用 `new` 操作符', function () {
        var noop = function (resolve, reject) {};
        var promise1 = new Promise(noop);

        assert.ok(promise1 instanceof Promise);
    });

    it ('解决自己应该得到 undefined 值', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(resolve, 0, promise);
        });

        promise.then(function (value) {
            assert.equal(value, undefined);
            done();
        });
    });

    it ('拒绝自己应该得到 undefined 值', function (done) {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(reject, 0, promise);
        });

        promise.then(function (value) {
            assert(false);
            done();
        }, function (reason) {
            assert.equal(reason, undefined);
            done();
        });
    });

    it ('拒绝后应该可以通过 `catch` 捕捉到原因', function (done) {
        var promise = new Promise(function (_, reject) {
            setTimeout(function () { reject(1); }, 0);
        });

        promise['catch'](function (reason) {
            assert.equal(reason, 1);
            done();
        });
    });

    it ('`resolver` 执行抛出异常可以正确处理', function (done) {
        var promise = new Promise(function(resolve, reject) {
            resolve(JSON.parse("This ain't JSON"));
        });

        promise.then(function(data) {
            assert(false);
            done();
        })['catch'](function(err) {
            assert.ok(err instanceof Error);
            done();
        });
    });

    it ('实例化的 promise 对象 `resolve` 后应该可以多次 then', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        promise.then(function (value) {
            assert.equal(value, 1);
        });

        promise.then(function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('实例化的 promise 对象 `reject` 后应该可以多次 then', function (done) {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () { reject(1); }, 0);
        });

        promise.then(0, function (value) {
            assert.equal(value, 1);
        });

        promise.then(0, function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('`then` 传入非函数参数，应该能忽略', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        promise.then(1234).then(new Date()).then(Math.E).then(function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('`resolve` 后，`then` 回调函数可以成功接收到 `resolve` 后的值', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        promise.then(function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('`reject` 后，`then` 回调函数可以成功接收到 `reject` 后的值', function (done) {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () { reject(1); }, 0);
        });

        promise.then(0, function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('不应该被 resolve 多次', function (done) {
        var resolver, rejector, fulfilled = 0, rejected = 0;
        var thenable = {
            then: function(resolve, reject) {
                resolver = resolve;
                rejector = reject;
            }
        };

        var promise = new Promise(function(resolve) {
            resolve(1);
        });

        promise.then(function(value){
            return thenable;
        }).then(function(value){
            fulfilled++;
        }, function(reason) {
            rejected++;
        });

        setTimeout(function() {
            resolver(1);
            resolver(1);
            rejector(1);
            rejector(1);

            setTimeout(function() {
                assert.equal(fulfilled, 1);
                assert.equal(rejected, 0);
                done();
            }, 20);
        }, 20);
    });

    describe('同步', function () {
        it ('(sync) 解决自己应该得到 undefined 值', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(promise);
            });

            promise.then(function (value) {
                assert.equal(value, undefined);
                done();
            });
        });

        it ('(sync) 拒绝自己应该得到 undefined 值', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject(promise);
            });

            promise.then(function (value) {
                assert(false);
                done();
            }, function (reason) {
                assert.equal(reason, undefined);
                done();
            });
        });

        it ('(sync) 拒绝后应该可以通过 `catch` 捕捉到原因', function (done) {
            var promise = new Promise(function (_, reject) {
                reject(1);
            });

            promise['catch'](function (reason) {
                assert.equal(reason, 1);
                done();
            });
        });

        it ('(sync) 实例化的 promise 对象应该可以多次 then', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(1);
            });

            promise.then(function (value) {
                assert.equal(value, 1);
            });

            promise.then(function (value) {
                assert.equal(value, 1);
                done();
            });
        });

        it ('(sync) 实例化的 promise 对象 `reject` 后应该可以多次 then', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject(1);
            });

            promise.then(0, function (value) {
                assert.equal(value, 1);
            });

            promise.then(0, function (value) {
                assert.equal(value, 1);
                done();
            });
        });

        it ('(sync) `then` 传入非函数参数，应该能忽略', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(1);
            });

            promise.then().then('').then([]).then(function (value) {
                assert.equal(value, 1);
                done();
            });
        });

        it ('(sync) `resolve` 后，`then` 回调函数可以成功接收到 `resolve` 后的值', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(1);
            });

            promise.then(function (value) {
                assert.equal(value, 1);
                done();
            });
        });

        it ('(sync) `reject` 后，`then` 回调函数可以成功接收到 `reject` 后的值', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject(1);
            });

            promise.then(0, function (value) {
                assert.equal(value, 1);
                done();
            });
        });
    });
});

describe ('链式调用', function () {
    it ('resolve 链式调用应该可以获取上一个回调的返回值', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        promise.then(function (value) {
            return ++value;
        }).then(function (value) {
            return ++value;
        }).then(function (value) {
            assert.equal(value, 3);
            done();
        });
    });

    it ('reject 只调用 then 链上的第一个回调', function (done) {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () { reject(1); }, 0);
        });

        promise.then(0, function (value) {
            value++;
            assert.equal(value, 2);
            done();
            return value;
        }).then(0, function (value) {
            assert(false);
            done();
            return ++value;
        }).then(0, function (value) {
            assert(false);
            done();
        });
    });

    it ('如果回调函数返回一个 promise 对象，则替换当前 promise 对象', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () {
                resolve(2);
            }, 0);
        });

        promise.then(function (value) {
            return new Promise(function (resolve) {
                resolve(value + 1);
            });
        }).then(function (value) {
            assert.equal(value, 3);
            done();
        });
    });

    it ('中途 `reject` 应该能执行正确的 `onReject` 回调', function (done) {
        var promise1 = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        var promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(2);
            }, 0);
        });

        promise1.then(function (value) {
            assert.equal(value, 1);
            return promise2;
        }, function (reason) { // never invoke
            assert(false);
            done();
        }).then().then(0).then(function (value) { // never invoke
            assert(false);
            done();
        }, function (reason) {
            assert.equal(reason, 2);
            done();
        });
    });

    describe('同步', function () {
        it ('(sync) resolve 链式调用应该可以获取上一个回调的返回值', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(1);
            });

            promise.then(function (value) {
                return ++value;
            }).then(function (value) {
                return ++value;
            }).then(function (value) {
                assert.equal(value, 3);
                done();
            });
        });

        it ('(sync) reject 只调用 then 链上的第一个回调', function (done) {
            var promise = new Promise(function (resolve, reject) {
                reject(1);
            });

            promise.then(0, function (value) {
                value++;
                assert.equal(value, 2);
                done();
                return value;
            }).then(0, function (value) {
                assert(false);
                done();
                return ++value;
            }).then(0, function (value) {
                assert(false);
                done();
            });
        });

        it ('(sync) 如果回调函数返回一个 promise 对象，则替换当前 promise 对象', function (done) {
            var promise = new Promise(function (resolve) {
                resolve(2);
            });

            promise.then(function (value) {
                return new Promise(function (resolve) {
                    resolve(value + 1);
                });
            }).then(function (value) {
                assert.equal(value, 3);
                done();
            });
        });

        it ('(sync) 中途 `reject` 应该能执行正确的 `onReject` 回调', function (done) {
            var promise1 = new Promise(function (resolve) {
                resolve(1);
            });

            var promise2 = new Promise(function (resolve, reject) {
                reject(2);
            });

            promise1.then(function (value) {
                assert.equal(value, 1);
                return promise2;
            }, function (reason) { // never invoke
                assert(false);
                done();
            }).then().then(1).then(function (value) { // never invoke
                assert(false);
                done();
            }, function (reason) {
                assert.equal(reason, 2);
                done();
            });
        });

    });
});

describe('Promise.cast', function () {
    it ('cast 普通值', function () {
        var value = 1;
        var casted = Promise.cast(value);

        assert(casted instanceof Promise);
        assert(casted !== value);
    });

    it ('cast null', function (done) {
        Promise.cast(null).then(function (value) {
            assert.equal(value, null);
            done();
        });
    });

    it ('cast undefined', function (done) {
        Promise.cast(undefined).then(function (value) {
            assert.equal(value, undefined);
            done();
        });
    });

    it ('cast 一个 promise 对象，应该返回该对象', function () {
        var promise1 = Promise.resolve(1);
        var promise = Promise.cast(promise1);
        assert.deepEqual(promise1, promise);
    });

    it ('cast 一个 thenable 对象', function () {
        var thenable = {'then': function () {}};
        var promise = Promise.cast(thenable);

        assert.ok(promise instanceof Promise);
        assert.notEqual(thenable, promise);
    });
});

describe('Promise.resolve', function () {
    it ('依赖的 thenable 完成后才完成', function (done) {
        var expectedValue, resolver, thenable, wrapped;

        expectedValue = 'the value';
        thenable = {
            then: function(resolve, reject){
                resolver = resolve;
            }
        };

        wrapped = Promise.resolve(thenable);

        wrapped.then(function(value) {
            assert(value === expectedValue);
            done();
        });

        resolver(expectedValue);
    })
});

describe('Promise.all', function () {
    it('非数组类型的参数，直接 `resolve`', function() {
        Promise.all().then(function (value) {
            assert.equal(value, undefined);
        });

        Promise.all({}).then(function (value) {
            assert.deepEqual(value, {});
        });

        Promise.all('').then(function (value) {
            assert.equal(value, '');
        });
    });

    it ('传入空数组应该返回空数组', function (done) {
        Promise.all([]).then(function(results) {
            assert(results.length === 0);
            done();
        });
    });

    it ('数组元素为 null，应该可以正常处理', function (done) {
        Promise.all([null]).then(function(results) {
            assert.equal(results[0], null);
            done();
        });
    });

    it ('仅当数组中所有其它 promise 都完成时才完成', function (done) {
        var firstResolved, secondResolved, firstResolver, secondResolver;

        var first = new Promise(function(resolve) {
            firstResolver = resolve;
        });
        first.then(function() {
            firstResolved = true;
        });

        var second = new Promise(function(resolve) {
            secondResolver = resolve;
        });
        second.then(function() {
            secondResolved = true;
        });

        setTimeout(function() {
            firstResolver(true);
        }, 0);

        setTimeout(function() {
            secondResolver(true);
        }, 0);

        Promise.all([first, second]).then(function(values) {
            assert(firstResolved);
            assert(secondResolved);
            done();
        });
    });

    it ('数组中的一个 reject 后，立刻 reject', function (done) {
        var firstResolver, secondResolver;

        var first = new Promise(function(resolve, reject) {
            firstResolver = { resolve: resolve, reject: reject };
        });

        var second = new Promise(function(resolve, reject) {
            secondResolver = { resolve: resolve, reject: reject };
        });

        setTimeout(function() {
            firstResolver.reject({});
        }, 0);

        var firstWasRejected, secondCompleted;

        first['catch'](function(){
            firstWasRejected = true;
        });

        second.then(function(){
            secondCompleted = true;
        }, function(err){
            secondCompleted = true;
            throw err;
        });

        Promise.all([first, second]).then(function() {
            assert(false);
        }, function() {
            assert(firstWasRejected);
            assert(!secondCompleted);
            done();
        });
    });

    it ('已解决后的数组值，其顺序应该与输入时保持一致', function (done) {
        var firstResolver, secondResolver, thirdResolver;

        var first = new Promise(function(resolve, reject) {
            firstResolver = { resolve: resolve, reject: reject };
        });

        var second = new Promise(function(resolve, reject) {
            secondResolver = { resolve: resolve, reject: reject };
        });

        var third = new Promise(function(resolve, reject) {
            thirdResolver = { resolve: resolve, reject: reject };
        });

        thirdResolver.resolve(3);
        firstResolver.resolve(1);
        secondResolver.resolve(2);

        Promise.all([first, second, third]).then(function(results) {
            assert(results.length === 3);
            assert(results[0] === 1);
            assert(results[1] === 2);
            assert(results[2] === 3);
            done();
        });
    });

    it ('一组包含 promises, thenable, 及普通类型值的数组，应该正确处理', function (done) {
        var promise = new Promise(function(resolve) { resolve(1); });
        var syncThenable = { then: function (onFulfilled) { onFulfilled(2); } };
        var asyncThenable = { then: function (onFulfilled) { setTimeout(function() { onFulfilled(3); }, 0); } };
        var nonPromise = 4;

        Promise.all([promise, syncThenable, asyncThenable, nonPromise]).then(function(results) {
            assert.deepEqual(results, [1, 2, 3, 4]);
            done();
        });
    });
});

describe('Promise.reject', function () {
    it('应该可以正确 reject', function () {
        var reason = 'the reason', promise = Promise.reject(reason);

        promise.then(function(){
            assert(false, 'should not fulfill');
        }, function(actualReason){
            assert.equal(reason, actualReason);
        });
    });
});

describe('assimilation (选自 es6-promise)', function() {
    it('should assimilate if `resolve` is called with a fulfilled promise', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var promise = new Promise(function(resolve) { resolve(originalPromise); });

        promise.then(function(value) {
            assert.equal(value, 'original value');
            done();
        });
    });

    it('should assimilate if `resolve` is called with a rejected promise', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var promise = new Promise(function(resolve) { resolve(originalPromise); });

        promise.then(function() {
            assert(false);
            done();
        }, function(reason) {
            assert.equal(reason, 'original reason');
            done();
        });
    });

    it('should assimilate if `resolve` is called with a fulfilled thenable', function(done) {
        var originalThenable = {
            then: function (onFulfilled) {
                setTimeout(function() { onFulfilled('original value'); }, 0);
            }
        };
        var promise = new Promise(function(resolve) { resolve(originalThenable); });

        promise.then(function(value) {
            assert.equal(value, 'original value');
            done();
        });
    });

    it('should assimilate if `resolve` is called with a rejected thenable', function(done) {
        var originalThenable = {
            then: function (onFulfilled, onRejected) {
                setTimeout(function() { onRejected('original reason'); }, 0);
            }
        };
        var promise = new Promise(function(resolve) { resolve(originalThenable); });

        promise.then(function() {
            assert(false);
            done();
        }, function(reason) {
            assert.equal(reason, 'original reason');
            done();
        });
    });


    it('should assimilate two levels deep, for fulfillment', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var nextPromise = new Promise(function(resolve) { resolve(originalPromise); });
        var promise = new Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function(value) {
            assert.equal(value, 'original value');
            done();
        });
    });

    it('should assimilate two levels deep, for rejection', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var nextPromise = new Promise(function(resolve) { resolve(originalPromise); });
        var promise = new Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function() {
            assert(false);
            done();
        }, function(reason) {
            assert.equal(reason, 'original reason');
            done();
        });
    });

    it('should assimilate three levels deep, mixing thenables and promises (fulfilled case)', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var intermediateThenable = {
            then: function (onFulfilled) {
                setTimeout(function() { onFulfilled(originalPromise); }, 0);
            }
        };
        var promise = new Promise(function(resolve) { resolve(intermediateThenable); });

        promise.then(function(value) {
            assert.equal(value, 'original value');
            done();
        });
    });

    it('should assimilate three levels deep, mixing thenables and promises (rejected case)', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var intermediateThenable = {
            then: function (onFulfilled) {
                setTimeout(function() { onFulfilled(originalPromise); }, 0);
            }
        };
        var promise = new Promise(function(resolve) { resolve(intermediateThenable); });

        promise.then(function() {
            assert(false);
            done();
        }, function(reason) {
            assert.equal(reason, 'original reason');
            done();
        });
    });
});

describe('alias (浏览器不支持的自定义别名或特性)', function () {
    it ('`done` 回调应该能正常处理 `resolve` 的值', function (done) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () { resolve(1); }, 0);
        });

        promise.done(function (value) {
            assert.equal(value, 1);
            done();
        });
    });

    it ('(sync) `done` 回调应该能正常处理 `resolve` 的值', function (done) {
        var promise = new Promise(function (resolve) {
            resolve(1);
        });

        promise.done(function (value) {
            assert.equal(value, 1);
            done();
        });
    });
});
