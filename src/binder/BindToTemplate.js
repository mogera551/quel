import "../types.js";
import { utils } from "../utils.js";
import { Templates } from "../view/Templates.js";
import { BindToDom } from "./BindToDom.js";

const DATASET_BIND_PROPERTY = "data-bind";
/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise("not Comment");

export class BindToTemplate {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const uuid = comment.textContent.slice(3);
    /** @type {HTMLTemplateElement} */
    const template = Templates.templateByUUID.get(uuid);
    /** @type {string} */
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY);

    // パース
    /** @type {BindInfo[]} */
    let binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, undefined);
    binds = binds.length > 0 ? [ binds[0] ] : [];
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }
}
