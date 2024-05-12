
/** @type {Set<string>} shadow rootが可能なタグ名一覧 */
const setOfAttachableTags = new Set([
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
 * @param {string} tagName 
 * @returns {boolean}
 */
const isCustomTag = tagName => tagName.indexOf("-") !== -1;

export class AttachShadow {
  /**
   * タグ名がshadow rootを持つことが可能か
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isAttachable(tagName) {
    return isCustomTag(tagName) || setOfAttachableTags.has(tagName);
  }
}
