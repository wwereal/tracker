
/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersion sdk版本
 * @extra 透传字段
 * @jsError js 和 promise 报错异常上报
 */
export interface DefaultOptions {
  uuid: string | undefined,
  requestUrl: string | undefined,
  historyTracker: boolean,
  hashTracker: boolean,
  domTracker: boolean,
  sdkVersion: string | number,
  extra: Record<string, any> | undefined,
  jsError: boolean,
}

//必传参数 requestUrl
export interface Options extends Partial<DefaultOptions> {
  requestUrl: string,
}

export enum TrackerConfig {
  version = '1.0.0',
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