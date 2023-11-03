import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise("not Comment");

export class BindToText {
  /**
   * バインドを実行する（ノードがComment（TextNodeの置換）の場合）
   * Commentノードをテキストノードに置換する
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    // コメントノードをテキストノードに差し替える
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    /** @type {Text} */
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, textNode, viewModel, bindText, DEFAULT_PROPERTY);

    return bindings;
  }

}
