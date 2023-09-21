import "../types.js";
import  { utils } from "../utils.js";
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
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    // コメントノードをテキストノードに差し替える
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    /** @type {Text} */
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(textNode, component, viewModel, context, bindText, DEFAULT_PROPERTY);
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }

}
