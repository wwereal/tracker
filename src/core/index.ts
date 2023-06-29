import { Options, DefaultOptions, TrackerConfig } from "../types/index";
import { createHistoryEvent } from "../utils/pv";
const MouseEventList: string[] = ['click', 'dblclick', 'contextmenu', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];
export default class Tracker {
  public data: Options;
  constructor(options: Options) {
    this.data = {
      ...this.initDef(),
      ...options
    };
    this.installTracker()
  }
  
  private initDef(): DefaultOptions {
    window.history['pushState'] = createHistoryEvent('pushState');
    window.history['replaceState'] = createHistoryEvent('replaceState');
    return <DefaultOptions>{
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
      sdkVersion: TrackerConfig.version,
    };
  }

  public setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
    this.data.uuid = uuid;
  }

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra;
  }
 
  // 手动上报
  public sendTracker <T>(data: T) {
    this.reportTracker(data);
  }

  // DOM上报
  private targetKeyReport () {
    MouseEventList.forEach((event) => {
      window.addEventListener(event, (e) => {
        const target = e.target as HTMLElement;
        const targetKey = target.getAttribute('target-key');
        if (targetKey) {
          this.reportTracker({
            event,
            targetKey,
          });
        }
      });
    });
  }

  private jsError () {
    this.errorEvent();
    this.promiseReject();
  }

  // JS 报错
  private errorEvent () {
    window.addEventListener('error', (event) => {
      this.reportTracker({
        event: 'error',
        targetKey: 'message',
        message: event.message,
      });
    });
  }
  
  // promise报错
  private promiseReject () {
    window.addEventListener('unhandledrejection', (event) => {
      event.promise.catch((error) => {
        this.reportTracker({
          event: 'error',
          targetKey: 'message',
          message: error,
        });
      });
    });
  }

  private captureEvents<T> (mouseEventList: string[], targetKey: string, data?: T) {
    mouseEventList.forEach((event) => {
      window.addEventListener(event, () => {
        console.log('listen');
        this.reportTracker({
          event,
          targetKey,
          data,
        })
      })
    })
  }

  private installTracker () {
    if (this.data.historyTracker) {
      this.captureEvents(['pushState', 'replaceState', 'popstate'], 'history-pv')
    }
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
    if (this.data.domTracker) {
      this.targetKeyReport();
    }
    if (this.data.jsError) {
      this.jsError();
    }
  }

  private reportTracker<T>(data: T) {
    const params = {
      ...this.data,
      ...data,
      time: new Date().getTime(),
    };
    let headers = {
      type: 'application/x-www-form-urlencoded'
    };
    let blob = new Blob([JSON.stringify(params)], headers);
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}