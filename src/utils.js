export class utils {
  /**
   * 
   * @param {string} message 
   */
  static raise(message) {
    throw new Error(message);
  }

  /**
   * to kebab case (upper camel, lower camel, snakeを想定)
   * @param {string} text 
   * @returns {string}
   */
  static toKebabCase = text => (typeof text === "string") ? text.replaceAll(/_/g, "-").replaceAll(/([A-Z])/g, (match,char,index) => (index > 0 ? "-" : "") + char.toLowerCase()) : text;

  /**
   * @returns {string}
   */
  static createUUID() {
    return window?.crypto?.randomUUID ? window.crypto.randomUUID()
     : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
        let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }
}
