const styleSheetByUuid:Map<string,CSSStyleSheet> = new Map;

// create style sheet by css text
function createStyleSheet(cssText:string):CSSStyleSheet {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

// get style sheet by uuid, if not found, create style sheet
export function create(cssText:string, uuid:string):CSSStyleSheet {
  const styleSheetFromMap = styleSheetByUuid.get(uuid);
  if (styleSheetFromMap) return styleSheetFromMap;
  const styleSheet = createStyleSheet(cssText);
  styleSheetByUuid.set(uuid, styleSheet);
  return styleSheet;
}

export function localizeStyleSheet(styleSheet:CSSStyleSheet, localSelector:string):CSSStyleSheet {
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
