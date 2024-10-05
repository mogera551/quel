const styleSheetByUUID: Map<string,CSSStyleSheet> = new Map;

// create style sheet by css text
function _createStyleSheet(cssText: string): CSSStyleSheet {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
}

/**
 * uuidからスタイルシートを取得します。見つからない場合はスタイルシートを作成します。
 * @param cssText スタイルシートのテキスト
 * @param uuid UUID
 * @returns {CSSStyleSheet} スタイルシート
 */
export function createStyleSheet(
  cssText: string, 
  uuid: string
): CSSStyleSheet {
  const styleSheetFromMap = styleSheetByUUID.get(uuid);
  if (styleSheetFromMap) return styleSheetFromMap;
  const styleSheet = _createStyleSheet(cssText);
  styleSheetByUUID.set(uuid, styleSheet);
  return styleSheet;
}

