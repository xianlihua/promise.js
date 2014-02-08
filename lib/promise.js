(function (fn) {
    var Promise = fn();
    if (typeof module !== 'undefined') {
        return (module.exports = Promise);
    }

    window.Promise = Promise;

})(function () {
    var undef = void 0;
    var PENDING = undef;
    var RESOLVED = 1;
    var REJECTED = 2;
    var noop = function (a) { return a; };

    /**
     * class: Promise
     */
    function Promise () {
        this.resolves = [];
        this.rejects = [];
        this.detail = undef;
        this.state = PENDING;
    }

    Promise.isPromise = function (object) {
        return object && typeof object.then === 'function' || false;
    };

    Promise.prototype.then = function (onResolve, onReject) {
        if (typeof onResolve !== 'function') {
            onResolve = noop;
        }

        if (typeof onReject !== 'function') {
            onReject = noop;
        }

        var defer = new Deferred();

        // 完成: 最关键的处理部分
        function done (data) {
            var ret = onResolve ? onResolve(data) : data;
            if (Promise.isPromise(ret)) {
                ret.then(function (data) {
                    defer.resolve(data);
                }, function (reason) {
                    defer.reject(reason);
                });
            } else {
                defer.resolve(ret);
            }
        }

        function fail (error) {
            var ret = onReject ? onReject(error) : error;
            if (Promise.isPromise(ret)) {
                ret.then(function (data) {
                    defer.reject(data);
                }, function (error) {
                    defer.reject(error);
                });
            } else {
                defer.reject(ret);
            }
        }

        if (!this.state) {
            this.resolves.push(done);
            this.rejects.push(fail);
        }
        else if (this.state === RESOLVED) {
            done(this.detail);
        }
        else if (this.state === REJECTED) {
            fail(this.detail);
        }

        return defer.promise;
    };

    Promise.prototype.done = function (onResolve) {
        return this.then(onResolve);
    };

    Promise.prototype.fail = function (onReject) {
        return this.then(undef, onReject);
    };

    Promise.prototype.catch = Promise.prototype.fail;

    /**
     * class: Deferred
     */
    function Deferred () {
        this.promise = new Promise();
    }

    Deferred.prototype.resolve = function (value) {
        var promise = this.promise;

        if (promise.state || invalid(this, value)) {
            return;
        }

        promise.state = RESOLVED;
        promise.detail = value;

        for (var i = 0, len = promise.resolves.length; i < len; i++) {
            promise.resolves[i](value)
        }
    };

    Deferred.prototype.reject = function (reason) {
        var promise = this.promise;

        if (promise.state) {
            return;
        }

        promise.state = REJECTED;
        promise.detail = reason;

        for (var i = 0, len = promise.rejects.length; i < len; i++) {
            promise.rejects[i](reason);
        }
    };

    // resolve(promise)
    function invalid (defer, value) {
        if (defer.promise === value) return false;

        if (Promise.isPromise(value)) {
            value.then(function (data) {
                defer.resolve(data);
            }, function (reason) {
                defer.reject(reason);
            });

            return true;
        }

        return false;
    }

    function ser (func) {
        if (typeof func !== 'function') {
            throw new TypeError();
        }

        var deferred = new Deferred();

        try {
            func(resolve, reject);
        } catch (e) {
            deferred.reject(e);
        }

        function resolve (value) {
            deferred.resolve(value);
        }

        function reject (reason) {
            deferred.reject(reason);
        }

        return deferred.promise;
    };

    ser.cast = function (x) {
        return x instanceof Promise ? x : ser.resolve(x);
    };

    ser.resolve = function (x) {
        return new ser(function (resolve, reject) {
            resolve(x);
        });
    };

    ser.reject = function (x) {
        return new ser(function(resolve, reject) {
            reject(x);
        });
    };

    ser.resolved = ser.resolve;

    ser.rejected = ser.reject;

    ser.all = function (array) {};
    ser.race = function (array) {};

    return ser;
});