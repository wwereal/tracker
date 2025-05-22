
/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersion sdk版本
 * @extra 透传字段
 * @jsError js 和 promise 报错异常上报
 */
// DefaultOptions 定义了 Tracker 的默认配置选项。
export interface DefaultOptions {
  uuid: string | undefined, // 用户唯一标识符
  requestUrl: string | undefined, // 数据上报的接口地址
  historyTracker: boolean, // 是否开启 history 路由变化跟踪
  hashTracker: boolean, // 是否开启 hash 路由变化跟踪
  domTracker: boolean, // 是否开启 DOM 元素点击事件跟踪（需要元素带有 target-key 属性）
  sdkVersion: string | number, // SDK 版本号
  extra: Record<string, any> | undefined, // 额外透传给后端的数据
  jsError: boolean, // 是否开启 JavaScript 和 Promise 错误跟踪
}

// Options 定义了初始化 Tracker 时可以传入的配置选项。
// 它继承了 DefaultOptions 的所有属性，并将它们设为可选，
// 同时将 requestUrl 设为必传参数。
export interface Options extends Partial<DefaultOptions> {
  requestUrl: string, // 数据上报的接口地址 (必传)
}

// TrackerConfig 枚举定义了 Tracker SDK 的一些常量配置。
export enum TrackerConfig {
  version = '1.0.0', // SDK 版本号
}
/* 
enum Direction {
  Up,
  Down,
  Left,
  Right
}

会转化成
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {})); 

*/