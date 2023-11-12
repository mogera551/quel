import "../types.js";

export class Dialog {
  /**
   * コンポーネントを動的に表示し、消滅するまで待つ
   * @param {string} dialogName 
   * @param {Object<string,any>} data 
   * @param {Object<string,any>} attributes 
   * @returns {Promise<boolean>}
   */
  static async open(dialogName, data, attributes) {
    const tagName = utils.toKebabCase(dialogName);
    const dialog = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      dialog.setAttribute(key, value);
    });
    Object.entries(data).forEach(([key, value]) => {
      dialog.props[Symbols.bindProperty](key, key, []);
      dialog.props[key] = value;
    });
    document.body.appendChild(dialog);
    return dialog.alivePromise;
  }

  /**
   * 動的に表示されたコンポーネントを閉じる
   * @param {Component} dialog 
   * @param {Object<string,any>} data 
   */
  static close(dialog, data) {
    Object.entries(data).forEach(([key, value]) => {
      dialog.props[key] = value;
    });
    dialog.parentNode.removeChild(dialog);
  }


}