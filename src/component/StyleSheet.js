
export class StyleSheet {
  /** @type {Map<string,CSSStyleSheet>} */
  static styleSheetByUuid = new Map;

  /**
   * create style sheet by css text
   * @param {string} cssText 
   * @returns {CSSStyleSheet}
   */
  static _create(cssText) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    return styleSheet;
  }

  /**
   * get style sheet by uuid, if not found, create style sheet
   * @param {string} cssText 
   * @param {string} uuid 
   * @returns {CSSStyleSheet|undefined}
   */
  static create(cssText, uuid) {
    const styleSheetFromMap = this.styleSheetByUuid.get(uuid);
    if (styleSheetFromMap) return styleSheetFromMap;
    const styleSheet = this._create(cssText);
    this.styleSheetByUuid.set(uuid, styleSheet);
    return styleSheet;
  }
}