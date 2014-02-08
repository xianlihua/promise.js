/**
 * 事件模型
 * {
 *   'type': [
 *     {'callback': callback, 'context': context}
 *   ]
 * }
 */
var events = {};
var Event = {
    'on': function (type, callback, context) {
        if (!events[type]) events[type] = [];
        events[type].push({'callback': callback, 'context': context || null});
    },

    /**
     * Event.off('click', fn, context)
     * Event.off('click', fn)
     * Event.off('click')
     * Event.off()
     */
    'off': function (type, callback, context) {
        var _events, retains;
        var types = type ? [type] : util.keys(events);

        // 需要取消的事件列表
        for (var i = 0, len = types.length; i < len; i++) {
            var event = types[i];

            // 有注册事件
            if (_events = events[event]) {
                events[event] = retains = [];

                // 找出不需要取消的事件
                if (callback || context) {
                    for (var j = 0; j < _events.length; j++) {
                        var _event = _events[j];

                        if ((context && context !== _event.context) || (callback && callback !== _event.callback)) {
                            retains.push(_event);
                        }
                    }
                }

                if (!retains.length) delete events[event];
            }
        }
    },

    'trigger': function (type) {
        if (!events[type]) return;

        var args = [].slice.call(arguments, 1);

        for (var i = 0, len = events[type].length; i < len; i++) {
            var event = events[type][i];
            var callback = event.callback;
            var context = event.context;
            callback.apply(context, args);
        }
    },

    'debug': function () {
        return events;
    }
};