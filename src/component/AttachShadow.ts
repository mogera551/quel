
// shadow rootが可能なタグ名一覧
const setOfAttachableTags:Set<string> = new Set([
  // See https://developer.mozilla.org/ja/docs/Web/API/Element/attachShadow
  "articles",
  "aside",
  "blockquote",
  "body",
  "div",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "main",
  "nav",
  "p",
  "section",
  "span",
]);

/**
 * タグ名がカスタム要素かどうか
 * →ダッシュ(-)を含むかどうか
 */
const isCustomTag = (tagName:string):boolean => tagName.indexOf("-") !== -1;

/**
 * タグ名がshadow rootを持つことが可能か
 */
export function isAttachable(tagName:string):boolean {
  return isCustomTag(tagName) || setOfAttachableTags.has(tagName);
}
