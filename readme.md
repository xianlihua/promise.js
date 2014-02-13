## 回调队列
queue = [function (data) { return data; }, function (data) { return data }]

## 执行入口
`resolve` -> 执行

    var promise = new Promise(function (resolve) {
        setTimeout(resolve, 0, 'hello');
    });

## 注册入口
`then` -> 注册

    then(
        function (data) {
            return some; // data == 'hello'
        }
    ).then(
        function (data) {
            return data; // data == some
        }
    );

## (1) sync resolver
- 执行内部 `resolve(1)`
- 检测内部变量 `queue == []`，非假，继续执行
- 将 `queue` 保存到 `resolve` 作用域，改变 `queue = null`
- 获取 `1` 的 promise 对象，保存到 Promise 构造函数内部的私有变量 `value` 上，此时

```javascript
value = new Promise(function (resolve) {
    resolve(1);
});
value.invoke = function (onResolve, onReject, resolve, reject) {
    resolve(onResolve && onResolve(1) || this);
};
```

- 队列出列，因未有 `then` 便 `resolve`，此时队列为空

```javascript
// 构造函数
// resolver: 用户传入的函数，构造函数实例化后，立刻执行
// resolver 回调函数接收 2 个函数参数：
//     resolvePromise(promiseValue): 解决态
//     rejectPromise (promiseReason): 拒绝态
//
// 关键点: 当前 promise 完成后，其 then 方法的函数参数会获得 `resolve` 或 `reject` 处理后的值

function Promise (resolver) {
    // 队列中的每一个函数，要做什么事？ 执行队列:
    // <1>. 说明 promise 已经完成，处于 `resolve` 或 `reject` 状态
    // <2>. 通过 `then` 入列的回调函数被执行
    // <3>. 每一个回调返回 promise 对象
    // function () {
    //     //
    // }
    var queue = [];


    try {
        resolver(resolvePromise, rejectPromise);
    } catch (e) {
        rejectPromise(e);
    }

    function resolvePromise (value) {
        if (!queue) return;

        var callbacks = queue;
        queue = undefined;

        for (var i = 0, len = callbacks.length; i < len; i++) {
            callbacks[i]();
        }
    }

    function rejectPromise (reason) {
        //
    }
}

// 回调入列(当队列被执行过时，立刻执行，否则入列等待执行)
// `then()` 返回一个 promise, 当该 promise 被解决后，链上的下一个 `then` 的回调才会执行，继续返回一个新的 promise
Promise.prototype.then = function (onResolve, onReject) {
    //
};
```
