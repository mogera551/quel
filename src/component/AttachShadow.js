
export class AttachShadow {
  /** @type {Set<string>} shadow rootが可能なタグ名一覧 */
  static setOfAttachableTags = new Set([
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
   * タグ名がカスタム要素かどうか→ダッシュ(-)を含むかどうか
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isCustomTag(tagName) {
    return tagName.indexOf("-") !== -1;
  }

  /**
   * タグ名がshadow rootを持つことが可能か
   * @param {string} tagName 
   * @returns {boolean}
   */
  static isAttachable(tagName) {
    return this.isCustomTag(tagName) || this.setOfAttachableTags.has(tagName);
  }
}
