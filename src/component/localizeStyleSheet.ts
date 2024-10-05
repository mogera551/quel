/**
 * スタイルシートのセレクタをローカライズする
 * @param styleSheet スタイルシート
 * @param localSelector ローカルセレクタ
 * @returns {CSSStyleSheet} ローカライズされたスタイルシート
 */
export function localizeStyleSheet(
  styleSheet: CSSStyleSheet, 
  localSelector: string
): CSSStyleSheet {
  for(let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i];
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
