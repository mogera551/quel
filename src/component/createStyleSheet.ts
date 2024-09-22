const styleSheetByUuid:Map<string,CSSStyleSheet> = new Map;

// create style sheet by css text
function _createStyleSheet(cssText:string):CSSStyleSheet {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

// get style sheet by uuid, if not found, create style sheet
export function createStyleSheet(
  cssText: string, 
  uuid: string
): CSSStyleSheet {
  const styleSheetFromMap = styleSheetByUuid.get(uuid);
  if (styleSheetFromMap) return styleSheetFromMap;
  const styleSheet = _createStyleSheet(cssText);
  styleSheetByUuid.set(uuid, styleSheet);
  return styleSheet;
}

