/** @type {Map<string,CSSStyleSheet>} */
const styleSheetByUuid = new Map;

/**
 * create style sheet by css text
 * @param {string} cssText 
 * @returns {CSSStyleSheet}
 */
function createStyleSheet(cssText) {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

export class StyleSheet {
  /**
   * get style sheet by uuid, if not found, create style sheet
   * @param {string} cssText 
   * @param {string} uuid 
   * @returns {CSSStyleSheet|undefined}
   */
  static create(cssText, uuid) {
    const styleSheetFromMap = styleSheetByUuid.get(uuid);
    if (styleSheetFromMap) return styleSheetFromMap;
    const styleSheet = createStyleSheet(cssText);
    styleSheetByUuid.set(uuid, styleSheet);
    return styleSheet;
  }
}