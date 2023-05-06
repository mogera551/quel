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

export class BindToText extends BindToDom {
  /**
   * 
   * @param {Node} node 
   * @param {import("../component/Component.js").Component} component
   * @param {import("../bindInfo/BindInfo.js").BindInfo?} contextBind 
   * @param {number[]} contextIndexes
   * @returns {import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  static bind(node, component, contextBind, contextIndexes) {
    // コメントノードをテキストノードに差し替える
    const viewModel = component.viewModel;
    const comment = toComment(node);
    const bindText = comment.textContent.slice(2); // @@をスキップ
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);

    // パース
    const parseBindText = this.parseBindText(textNode, component, viewModel, contextBind, contextIndexes);
    const binds = parseBindText(bindText, DEFAULT_PROPERTY);
    binds.forEach(this.applyUpdateNode);

    return binds;
  }

}