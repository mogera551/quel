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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    // コメントノードをテキストノードに差し替える
    const viewModel = component.viewModel;
    const comment = toComment(node);
    const bindText = comment.textContent.slice(3); // @@:をスキップ
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    const parseBindText = BindToDom.parseBindText(textNode, component, viewModel, context);
    const binds = parseBindText(bindText, DEFAULT_PROPERTY);
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }

}