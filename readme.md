## 简介

promise.js 是一个 es6 promise 的跨浏览器及 Node.js 环境的实现。
Promise 是异步编程中的一种相对友好且易于使用的方法

## 使用

```javascript
var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve('hello world!');
    }, 0);
});

promise.then(function (value) {
    console.log(value); // hello world!
});
```

## 方法

### promise.then(onResolve, onReject)

then 是 Promise 的基本方法，当 promise 被 resolve 后，执行 onResolve 函数并给出 resolve 后的值；当 promise 被 reject 后，执行 onReject 函数并给出 reject 的原因；

### promise.catch(onReject)

catch 可以看作是 then 的特例，在 promise 被 reject 后 onReject 函数将被执行，相当于:

```javascript
promise.then(0, onReject);
```

该方法仅仅是为了实现 Promise 规范接口的目的，实际使用中如需要兼容 IE8 及以下浏览器，该方法不能使用(catch 是 Javascript 关键字)

### promise.done(onResolve)

相当于:

```javascript
promise.then(onResolve);
```

### promise.fail(onReject)

catch 的别名，相当于:

```javascript
promise.catch(onReject);
```

注意：在IE8及以下浏览器下，使用 Javascript 关键字 `cache` 会引起报错，使用 fail 方法更安全

## 静态方法

### Promise.cast(x)

如果 x 是 Promise 对象，直接返回；否则返回状态为 `resolved` 值为 `x` 的 Promise 对象

```javascript
Promise.cast('xianlihua').then(function (value) {
    console.log(value); // xianlihua
});
```

### Promise.all(array)

转化 array 的每一个元素为 Promise 对象，返回当数组中所有 Promise 对象都 `resolved` 之后才 `resolved` 的 Promise 对象

```javascript
var promise = new Promise(function (resolve, reject) {
    resolve('hello');
});

Promise.all(['string', promise, 5]).then(function (results) {
    console.log(results); // ["string", "hello", 5]
});
```

### Promise.resolve(x)

返回状态为 `resolved` 值为 `x` 的 Promise 对象

```javascript
Promise.resolve('hello').then(function (value) {
    console.log(value); // hello
});
```

### Promise.reject(x)

返回状态为 `rejected` 原因为 `x` 的 Promise 对象

```javascript
Promise.reject('Stack Overflow!').then(0, function (reason) {
    console.log(reason); // Stack Overflow!
});
```
