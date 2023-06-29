export const createHistoryEvent = <T extends keyof History>(key: T) => {
  const origin = history[key] as Function;

  return function() {
    const res = origin.apply(this, arguments);
    const e = new Event(key);
    window.dispatchEvent(e);
    return res;
  }
}
