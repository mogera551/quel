import "../types.js";

const bindValue = (target) => (value) => (typeof value === "function") ? value.bind(target) : value;

class Handler {
  /**
   * Proxy.get
   * @param {Component} target
   * @param {string} prop
   * @param {Proxy<Handler>} receiver
   * @returns {any|undefined}
   */
  get(target, prop, receiver) {
    const accessibleProperties = new Set(target.accessibleProperties);
    const allProperties = new Set(target.allProperties);
    if (allProperties.has(prop)) {
      if (accessibleProperties.has(prop)) {
        return bindValue(target)(target[prop]);
      }
    } else {
      // mixedInしたプロパティでない場合、そのままアクセスOK
      return bindValue(target)(target[prop]);
    }
  }
}

export const createUserComponent = (component) => new Proxy(component, new Handler);
