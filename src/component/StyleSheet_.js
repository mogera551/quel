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

/**
 * get style sheet by uuid, if not found, create style sheet
 * @param {string} cssText 
 * @param {string} uuid 
 * @returns {CSSStyleSheet|undefined}
 */
export function create(cssText, uuid) {
  const styleSheetFromMap = styleSheetByUuid.get(uuid);
  if (styleSheetFromMap) return styleSheetFromMap;
  const styleSheet = createStyleSheet(cssText);
  styleSheetByUuid.set(uuid, styleSheet);
  return styleSheet;
}

/**
 * 
 * @param {CSSStyleSheet} styleSheet 
 * @param {string} localSelector 
 * @returns 
 */
export function localizeStyleSheet(styleSheet, localSelector) {
  for(let rule of styleSheet.cssRules) {
    if (rule instanceof CSSStyleRule) {
      const newSelectorText = rule.selectorText.split(",").map(selector => {
        if (selector.trim().startsWith(":host")) {
          return selector.replace(":host", localSelector);
        }
        return `${localSelector} ${selector}`;
      }).join(",");
      rule.selectorText = newSelectorText;
    }
  }
  return styleSheet;
}
