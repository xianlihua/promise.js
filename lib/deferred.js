/**
 * Promise, for easily async develope of javascript
 * @param {Function} func
 *
 * var promise = Promise(function (resolve, reject) {
 *     setTimeout(function () {
 *         resolve([123]);
 *     }, 1000);
 * });
 *
 * promise.then(function done (data) {
 *     console.log('OK: ', data);
 * }, function error (err) {
 *     console.log('Error: ', err);
 * })
 */

(function (fn) {
    var Deferred = fn();

    if (typeof module !== 'undefined') {
        module.exports = Deferred;
    } else {
        window.Deferred = Deferred;
    }
})(function () {

    function Deferred () {
        var PENDING = 0;
        var RESOLVED = 1;
        var REJECTED = 2;
        var resolves = [], rejects = [], detail, i, state = PENDING;

        return {
            'resolve': function ( data ) {
                if (state) {
                    return;
                }

                state = RESOLVED;
                detail = data;

                for (i = 0, len = resolves.length; i < len; i++) {
                    detail = resolves[i](detail);
                }

                resolves = void 0;
            },

            'reject': function (reason) {
                if (state) {
                    return;
                }

                state = REJECTED;
                detail = reason;

                rejects[0] && rejects[0](detail);

                rejects = void 0;
            },

            'promise': {
                'then': function ( onResolve, onReject ) {
                    var callbacks = arguments;

                    for (i = 0, len = callbacks.length; i < len; i++) {
                        var fn = typeof callbacks[i] === 'function' && callbacks[i];
                        if (fn) {
                            var queue = [resolves, rejects];
                            if (queue[i]) {
                                queue[i].push(fn);
                            } else {
                                detail = fn(detail);
                            }
                        }
                    }

                    return this;
                },

                'done': function (callback) {
                    return this.then.call(this, callback);
                },

                'catch': function (callback) {
                    return this.then.call(this, void 0, callback);
                },

                'fail': function (callback) {
                    return this.catch(callback);
                }
            }
        };
    };

    return Deferred;
});

