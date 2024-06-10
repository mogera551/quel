import * as Template from "../component/Template.js";
import "../types.js";
import { utils } from "../utils.js";
import { bindTextToBindings } from "./bindTextToBindings.js";

const moduleName = "BindToTemplate";

const DATASET_BIND_PROPERTY = "data-bind";
/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise(`${moduleName}: not Comment`);

/** @type {Object<string,string>} */
const bindTextByKey = {};

/**
 * バインドを実行する（ノードがComment（Templateの置換）の場合）
 * @param {import("../binding/Binding.js").BindingManager} bindingManager
 * @param {SelectedNode} selectedNode 
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function bind(bindingManager, selectedNode) {
  /** @type {Node} */
  const node = selectedNode.node;
  /** @type {ViewModel} */
  const viewModel = bindingManager.component.viewModel;
  /** @type {Comment} */
  const comment = toComment(node);
  /** @type {string} */
  const uuid = comment.textContent.slice(3);
  /** @type {HTMLTemplateElement} */
  const template = Template.getByUUID(uuid);
  (typeof template === "undefined") && utils.raise(`${moduleName}: template not found`);
  /** @type {string} */
  const bindText = bindTextByKey[selectedNode.key] ?? (
    bindTextByKey[selectedNode.key] = template.getAttribute(DATASET_BIND_PROPERTY) ?? undefined
  );
  (typeof bindText === "undefined") && utils.raise(`${moduleName}: data-bind is not defined`);

  // パース
  /** @type {import("../binding/Binding.js").Binding[]} */
  const bindings = bindTextToBindings(bindingManager, selectedNode, viewModel, bindText, undefined);

  return bindings;
}
