
const ADOPTED_VAR_NAME = '--adopted-css';

export class AdoptedCss {
  /** @type {Map<string,CSSStyleSheet>} */
  static adoptedCssByTitle = new Map;
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
      const adoptedCss = new CSSStyleSheet();
      const css = styleSheets.find(sheet => sheet.title === cssTitle);
      if (!css) return;
      Array.from(css.cssRules).map(rule => adoptedCss.insertRule(rule.cssText));
      this.adoptedCssByTitle.set(cssTitle, adoptedCss);
      return adoptedCss;
    }).filter(css => css);

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
