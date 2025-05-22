import { Options, DefaultOptions, TrackerConfig } from "../types/index";
import { createHistoryEvent } from "../utils/pv";
// MouseEventList 是一个包含了所有需要监听的鼠标事件类型的数组。
// 它用于在 DOM 元素上注册事件监听器，以便跟踪用户的交互行为。
const MouseEventList: string[] = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];
// Tracker 类是核心跟踪器，用于初始化和管理各种跟踪功能。
// 它可以跟踪页面历史记录变化、哈希路由变化、DOM 元素交互以及 JavaScript 错误。
export default class Tracker {
  public data: Options; // 存储 Tracker 实例的配置选项和收集的数据。
  // Tracker 类的构造函数。
  // @param options - 初始化 Tracker 实例的配置选项。
  constructor(options: Options) {
    this.data = {
      ...this.initDef(),
      ...options
    };
    this.installTracker() // 初始化并安装跟踪器
  }
  
  // initDef 方法用于初始化并返回默认配置选项。
  // 它会重写 window.history 的 pushState 和 replaceState 方法，以便跟踪历史记录变化。
  // @returns DefaultOptions - 包含默认配置的对象。
  private initDef(): DefaultOptions {
    window.history['pushState'] = createHistoryEvent('pushState');
    window.history['replaceState'] = createHistoryEvent('replaceState');
    return <DefaultOptions>{
      historyTracker: false, // 是否开启历史记录跟踪
      hashTracker: false,    // 是否开启哈希路由跟踪
      domTracker: false,     // 是否开启 DOM 元素交互跟踪
      jsError: false,        // 是否开启 JavaScript 错误跟踪
      sdkVersion: TrackerConfig.version, // SDK 版本号
    };
  }

  // setUserId 方法用于设置用户ID。
  // @param uuid - 要设置的用户ID。
  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid;
  }

  // setExtra 方法用于设置额外的跟踪数据。
  // @param extra - 要设置的额外数据。
  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra;
  }
 
  // sendTracker 方法用于手动上报跟踪数据。
  // @param data - 要上报的自定义数据。
  public sendTracker <T>(data: T) {
    this.reportTracker(data);
  }

  // targetKeyReport 方法用于上报 DOM 元素的交互事件。
  // 它会遍历 MouseEventList 中的所有事件类型，并为每个事件类型在 window 上添加事件监听器。
  // 当监听到事件时，它会检查事件目标元素是否包含 'target-key' 属性，如果包含，则上报相关数据。
  private targetKeyReport () {
    MouseEventList.forEach((event) => {
      window.addEventListener(event, (e) => {
        const target = e.target as HTMLElement;
        const targetKey = target.getAttribute('target-key');
        if (targetKey) {
          this.reportTracker({
            event, // 事件类型
            targetKey, // 目标元素的 'target-key' 属性值
          });
        }
      });
    });
  }

  // jsError 方法用于统一处理 JavaScript 错误。
  // 它会调用 errorEvent 和 promiseReject 方法来分别处理同步错误和 Promise 异步错误。
  private jsError () {
    this.errorEvent(); // 处理同步错误
    this.promiseReject(); // 处理 Promise 异步错误
  }

  // errorEvent 方法用于捕获和上报 JavaScript 同步错误。
  // 它在 window 上添加 'error' 事件监听器，当发生错误时，上报错误信息。
  private errorEvent () {
    window.addEventListener('error', (event) => {
      this.reportTracker({
        event: 'error', // 事件类型为 'error'
        targetKey: 'message', // 目标键为 'message'
        message: event.message, // 错误信息
      });
    });
  }
  
  // promiseReject 方法用于捕获和上报 Promise 异步错误。
  // 它在 window 上添加 'unhandledrejection' 事件监听器，当有未处理的 Promise reject 时，上报错误信息。
  private promiseReject () {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch((error) => {
        this.reportTracker({
          event: 'error', // 事件类型为 'error'
          targetKey: 'message', // 目标键为 'message'
          message: error, // 错误信息
        });
      });
    });
  }

  // captureEvents 方法是一个通用的事件捕获和上报函数。
  // @param mouseEventList - 需要监听的事件类型数组。
  // @param targetKey - 上报数据中的目标键。
  // @param data - 可选的额外数据。
  private captureEvents<T> (mouseEventList: string[], targetKey: string, data?: T) {
    mouseEventList.forEach((event) => {
      window.addEventListener(event, () => {
        console.log('listen'); // 在控制台打印日志，表示事件已被监听
        this.reportTracker({
          event, // 事件类型
          targetKey, // 目标键
          data, // 额外数据
        })
      })
    })
  }

  // installTracker 方法用于根据配置选项安装不同的跟踪器。
  // 它会检查 historyTracker, hashTracker, domTracker, 和 jsError 选项的状态，
  // 并相应地调用 captureEvents, targetKeyReport, 或 jsError 方法来启用对应的跟踪功能。
  private installTracker () {
    // 如果启用了 historyTracker，则捕获 'pushState', 'replaceState', 'popstate' 事件，并以上报 'history-pv' 为目标键。
    if (this.data.historyTracker) {
      this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv')
    }
    // 如果启用了 hashTracker，则捕获 'hashchange' 事件，并以上报 'hash-pv' 为目标键。
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
    // 如果启用了 domTracker，则调用 targetKeyReport 方法来跟踪 DOM 元素交互。
    if (this.data.domTracker) {
      this.targetKeyReport();
    }
    // 如果启用了 jsError，则调用 jsError 方法来跟踪 JavaScript 错误。
    if (this.data.jsError) {
      this.jsError();
    }
  }

  // reportTracker 方法用于将收集到的跟踪数据发送到服务器。
  // @param data - 要上报的跟踪数据。
  private reportTracker<T>(data: T) {
    const params = {
      ...this.data, // 合并 Tracker 实例的配置和基本数据
      ...data, // 合并传入的特定跟踪数据
      time: new Date().getTime(), // 添加时间戳
    };
    let headers = {
      type: 'application/x-www-form-urlencoded' // 设置请求头
    };
    // 使用 navigator.sendBeacon API 发送数据，确保即使在页面卸载时也能发送成功。
    let blob = new Blob([JSON.stringify(params)], headers);
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}