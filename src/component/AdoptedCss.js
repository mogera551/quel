
const ADOPTED_VAR_NAME = '--adopted-css';

export class AdoptedCss {
  /** @type {Map<string,CSSStyleSheet>} */
  static styleSheetByName = new Map;
  /**
   * copy style rules to adopted style sheet
   * @param {CSSStyleSheet} fromStyleSheet 
   * @param {CSSStyleSheet} toStyleSheet 
   */
  static copyStyleRules(fromStyleSheet, toStyleSheet) {
    Array.from(fromStyleSheet.cssRules).map(rule => {
      if (rule.constructor.name === "CSSImportRule") {
        this.copyStyleRules(rule.styleSheet, toStyleSheet);
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
  static createStyleSheet(name) {
    const styleSheet = new CSSStyleSheet();
    const matchTitle = sheet => sheet.title === name;
    const fromStyleSheet = Array.from(document.styleSheets).find(matchTitle);
    if (!fromStyleSheet) {
      // ToDo: warning
      return;
    }
    this.copyStyleRules(fromStyleSheet, styleSheet);
    this.styleSheetByName.set(name, styleSheet);
    return styleSheet;
  }
  /**
   * get adopted css list by names
   * @param {string[]} names 
   * @returns {CSSStyleSheet[]}
   */
  static getStyleSheetList(names) {
      // find adopted style sheet from map, if not found, create adopted style sheet
      const getStyleSheet = name => this.styleSheetByName.get(name) ?? this.createStyleSheet(name);
      const excludeEmpty = styleSheet => styleSheet;
      return names.map(getStyleSheet).filter(excludeEmpty);
  }
  /**
   * adopt css by component's shadow root
   * @param {Component} component 
   */
  static adoptByComponent(component) {
    // get adopted css names from component style variable '--adopted-css'
    const trim = name => name.trim();
    const excludeEmpty = name => name.length > 0;
    const names = getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmpty) ?? [];
    if (names.length === 0) return;
    // get adopted style sheet list
    const adoptedStyleSheetList = this.getStyleSheetList(names);
    if (adoptedStyleSheetList.length === 0) {
      // ToDo: warning
      return;
    }
    component.shadowRoot.adoptedStyleSheets = adoptedStyleSheetList;
  }
}
