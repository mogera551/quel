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
const toComment = node => (node instanceof Comment) ? node : utils.raise("BindToTemplate: not Comment");

export class BindToTemplate {
  /**
   * バインドを実行する（ノードがComment（Templateの置換）の場合）
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {Comment} */
    const comment = toComment(node);
    /** @type {string} */
    const uuid = comment.textContent.slice(3);
    /** @type {HTMLTemplateElement} */
    const template = Templates.templateByUUID.get(uuid);
    (typeof template === "undefined") && utils.raise(`BindToTemplate: template not found`);
    /** @type {string} */
    const bindText = template.getAttribute(DATASET_BIND_PROPERTY) ?? undefined;
    (typeof bindText === "undefined") && utils.raise(`BindToTemplate: data-bind is not defined`);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, undefined);

    return bindings;
  }
}
