const styleSheetByName:Map<string,CSSStyleSheet> = new Map;

/**
 * copy style rules to adopted style sheet
 */
function copyStyleRules(fromStyleSheet:CSSStyleSheet, toStyleSheet:CSSStyleSheet) {
  Array.from(fromStyleSheet.cssRules).map(rule => {
    if (rule.constructor.name === "CSSImportRule") {
      const importRule = (rule as CSSImportRule);
      if (importRule.styleSheet) {
        copyStyleRules(importRule.styleSheet, toStyleSheet);
      } else {
        console.log(`import rule not found: ${importRule.href}`);
      }
    } else {
      toStyleSheet.insertRule(rule.cssText, toStyleSheet.cssRules.length);
    }
  });
}

/**
 * create adopted style sheet by name, and copy style rules from existing style sheet
 */
/**
 * title属性名に一致するスタイルシートを取得し複製します
 * @param name title属性名
 * @returns {CSSStyleSheet} スタイルシート
 */
function createStyleSheet(name: string): CSSStyleSheet|undefined {
  const styleSheet = new CSSStyleSheet();
  const matchTitle = (sheet:CSSStyleSheet) => sheet.title === name;
  const fromStyleSheets = Array.from(document.styleSheets).filter(matchTitle);
  if (fromStyleSheets.length === 0) {
    console.log(`style sheet not found: ${name}`);
    return;
  }
  fromStyleSheets.forEach(fromStyleSheet => copyStyleRules(fromStyleSheet, styleSheet));
  styleSheetByName.set(name, styleSheet);
  return styleSheet;
}

const trim = (name: string): string => name.trim();

/**
 * 
 * @param {string} name 
 * @returns {CSSStyleSheet}
 */
const getStyleSheet = (name:string):CSSStyleSheet|undefined => styleSheetByName.get(name) ?? createStyleSheet(name);

/**
 * exclude empty style sheet
 */
const excludeEmptySheet = (styleSheet:CSSStyleSheet|undefined) => typeof styleSheet !== "undefined";

/**
 * get adopted css list by names
 */
/**
 * 名前リストに一致するスタイルシートを取得し複製します
 * @param names 名前リスト
 * @returns {CSSStyleSheet[]} 複製したスタイルシートリスト
 */
export function getStyleSheetListByNames(names: string[]): CSSStyleSheet[] {
    // find adopted style sheet from map, if not found, create adopted style sheet
    return names.map(getStyleSheet).filter(excludeEmptySheet);
}

