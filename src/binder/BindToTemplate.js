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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    const viewModel = component.viewModel;
    const comment = toComment(node);
    const uuid = comment.textContent.slice(3);
    const template = Templates.templateByUUID.get(uuid);
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY);

    // パース
    let binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, undefined);
    binds = binds.length > 0 ? [ binds[0] ] : [];
    binds.forEach(BindToDom.applyUpdateNode);

    return binds;
  }
}

window.elapsedTimes["BindToTemplate.bind"] = 0;
