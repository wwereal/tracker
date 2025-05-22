// createHistoryEvent 函数用于创建一个新的 history 事件。
// 当浏览器历史记录发生变化时（例如，通过 pushState 或 replaceState），
// 这个函数可以用来触发一个自定义事件，从而允许应用程序捕获这些变化并做出响应。
//
// @param key - history 对象的方法名，例如 'pushState' 或 'replaceState'。
//            类型参数 T 被约束为 History 接口的键，确保传入的 key 是有效的 history 方法名。
// @returns Function - 返回一个新的函数。当这个新函数被调用时，它会：
//                   1. 调用原始的 history 方法 (history[key])。
//                   2. 创建一个以 key 为类型的新 Event 对象。
//                   3. 在 window 对象上派发这个新创建的事件。
//                   4. 返回原始 history 方法的执行结果。
export const createHistoryEvent = <T extends keyof History>(key: T) => {
  // history[key] 获取原始的 history 对象上的方法，例如 history.pushState。
  // 使用 as Function 将其类型断言为函数，以便后续调用。
  const origin = history[key] as Function;

  return function() {
    // origin.apply(this, arguments) 调用原始的 history 方法。
    // this 指向调用新函数的上下文（通常是 history 对象本身）。
    // arguments 包含了调用新函数时传入的所有参数。
    const res = origin.apply(this, arguments);
    // new Event(key) 创建一个新的事件对象，事件类型为传入的 key (例如 'pushState')。
    const e = new Event(key);
    // window.dispatchEvent(e) 在 window 对象上派发这个新创建的事件。
    // 这使得其他代码可以通过在 window 上监听这个事件类型来响应 history 变化。
    window.dispatchEvent(e);
    // 返回原始 history 方法的执行结果。
    return res;
  }
}
