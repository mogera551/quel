export default class {
  /**
   * 
   * @param {string} message 
   */
  static raise(message) {
    throw message;
  }

  /**
   * 関数かどうかをチェック
   * @param {any} obj 
   * @returns {boolean}
   */
  static isFunction = (obj) => {
    const toString = Object.prototype.toString;
    const text = toString.call(obj).slice(8, -1).toLowerCase();
    return (text === "function" || text === "asyncfunction");
  }

  /**
   * 
   * @param {HTMLElement} element 
   * @returns {boolean}
   */
  static isInputableElement(element) {
    return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || 
      (element instanceof HTMLInputElement && element.type !== "button");
  }

  /**
   * Snake case to kebab case
   * @param {string} text 
   * @returns {string}
   */
  static toKebabCase = text => text.replaceAll(/([A-Z])/g, (match,char,index) => (index > 0 ? "-" : "") + char.toLowerCase());

}