
const ADOPTED_VAR_NAME = '--adopted-css';

/** @type {Map<string,CSSStyleSheet>} */
const styleSheetByName = new Map;

/**
 * copy style rules to adopted style sheet
 * @param {CSSStyleSheet} fromStyleSheet 
 * @param {CSSStyleSheet} toStyleSheet 
 */
function copyStyleRules(fromStyleSheet, toStyleSheet) {
  Array.from(fromStyleSheet.cssRules).map(rule => {
    if (rule.constructor.name === "CSSImportRule") {
      copyStyleRules(rule.styleSheet, toStyleSheet);
    } else {
      toStyleSheet.insertRule(rule.cssText, toStyleSheet.cssRules.length);
    }
  });
}

/**
 * create adopted style sheet by name, and copy style rules from existing style sheet
 * @param {string} name 
 * @returns 
 */
function createStyleSheet(name) {
  const styleSheet = new CSSStyleSheet();
  const matchTitle = sheet => sheet.title === name;
  const fromStyleSheet = Array.from(document.styleSheets).find(matchTitle);
  if (!fromStyleSheet) {
    // ToDo: warning
    return;
  }
  copyStyleRules(fromStyleSheet, styleSheet);
  styleSheetByName.set(name, styleSheet);
  return styleSheet;
}

/**
 * trim name
 * @param {string} name 
 * @returns {string}
 */
const trim = name => name.trim();

/**
 * exclude empty name
 * @param {string} name 
 * @returns {boolean}
 */
const excludeEmptyName = name => name.length > 0;

/**
 * 
 * @param {string} name 
 * @returns {CSSStyleSheet}
 */
const getStyleSheet = name => styleSheetByName.get(name) ?? createStyleSheet(name);

/**
 * exclude empty style sheet
 * @param {CSSStyleSheet} styleSheet 
 * @returns {CSSStyleSheet}
 */
const excludeEmptySheet = styleSheet => styleSheet;

export class AdoptedCss {
  /**
   * get adopted css list by names
   * @param {string[]} names 
   * @returns {CSSStyleSheet[]}
   */
  static getStyleSheetList(names) {
      // find adopted style sheet from map, if not found, create adopted style sheet
      return names.map(getStyleSheet).filter(excludeEmptySheet);
  }

  /**
   * get name list from component style variable '--adopted-css'
   * @param {Component} component 
   * @returns {string[]}
   */
  static getNamesFromComponent(component) {
    // get adopted css names from component style variable '--adopted-css'
    return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmptyName) ?? [];
  }
}
