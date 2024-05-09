
const ADOPTED_VAR_NAME = '--adopted-css';

export class AdoptedCss {
  /** @type {Map<string,CSSStyleSheet>} */
  static adoptedCssByTitle = new Map;
  /**
   * 
   * @param {CSSStyleSheet} styleSheet 
   * @param {CSSStyleSheet} adoptedStyleSheet 
   */
  static copyStyleRules(styleSheet, adoptedStyleSheet) {
    Array.from(styleSheet.cssRules).map(rule => {
      if (rule.constructor.name !== "CSSImportRule") {
        adoptedStyleSheet.insertRule(rule.cssText, adoptedStyleSheet.cssRules.length) 
      } else {
        this.copyStyleRules(rule.styleSheet, adoptedStyleSheet);
      }
    });
  }
  /**
   * 
   * @param {string[]} cssTitles 
   * @returns {CSSStyleSheet[]}
   */
  static createAdoptedCsss(cssTitles) {
    const styleSheets= Array.from(document.styleSheets);
    return cssTitles.map(cssTitle => {
      const  adoptedCssByMap = this.adoptedCssByTitle.get(cssTitle);
      if (adoptedCssByMap) return adoptedCssByMap;
      const adoptedStyleSheet = new CSSStyleSheet();
      const styleSheet = styleSheets.find(sheet => sheet.title === cssTitle);
      if (!styleSheet) return;
      this.copyStyleRules(styleSheet, adoptedStyleSheet);
      this.adoptedCssByTitle.set(cssTitle, adoptedStyleSheet);
      return adoptedStyleSheet;
    }).filter(styleSheet => styleSheet);

  }
  /**
   * 
   * @param {Component} component 
   */
  static adoptByComponent(component) {
    const cssTitles = getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(css => css.trim()).filter(css => css.length > 0) ?? [];
    if (cssTitles.length === 0) return;
    const adoptedCsss = this.createAdoptedCsss(cssTitles);
    if (adoptedCsss.length === 0) return;
    component.shadowRoot.adoptedStyleSheets = adoptedCsss;
  }
}
