import "../types.js";

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
    if (accessibleProperties.has(prop)) {
      const type = typeof target[prop];
      if (type === "function") {
        return target[prop].bind(target);
      } else {
        return target[prop];
      }
    }
  }
}

export const createUserComponent = (component) => new Proxy(component, new Handler);
