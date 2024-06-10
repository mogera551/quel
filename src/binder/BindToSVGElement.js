import "../types.js";
import { utils } from "../utils.js";
import { bindTextToBindings } from "./bindTextToBindings.js";

const moduleName = "BindToSVGElement";

const DATASET_BIND_PROPERTY = "data-bind";

/**
 * 
 * @param {SelectedNode} selectedNode 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`${moduleName}: not SVGElement`);

/** @type {Object<string,string>} */
const bindTextByKey = {};

/**
 * バインドを実行する（ノードがSVGElementの場合）
 * @param {import("../binding/Binding.js").BindingManager} bindingManager
 * @param {SelectedNode} selectedNode 
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function bind(bindingManager, selectedNode) {
  /** @type {Node} */
  const node = selectedNode.node;
  /** @type {ViewModel} */
  const viewModel = bindingManager.component.viewModel;
  /** @type {SVGElement} */
  const element = toSVGElement(node);
  /** @type {string} */
  const bindText = bindTextByKey[selectedNode.key] ?? (
    bindTextByKey[selectedNode.key] = element.getAttribute(DATASET_BIND_PROPERTY) ?? undefined
  );
  (typeof bindText === "undefined") && utils.raise(`${moduleName}: data-bind is not defined`);

  element.removeAttribute(DATASET_BIND_PROPERTY);
  /** @type {string|undefined} */
  const defaultName = undefined;

  // パース
  /** @type {import("../binding/Binding.js")bindTextToBinds.Binding[]} */
  return bindTextToBindings(bindingManager, selectedNode, viewModel, bindText, defaultName);
}
