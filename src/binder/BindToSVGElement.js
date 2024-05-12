import "../types.js";
import { utils } from "../utils.js";
import * as BindToDom from "./BindToDom.js";

const moduleName = "BindToSVGElement";

const DATASET_BIND_PROPERTY = "data-bind";

/**
 * 
 * @param {Node} node 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`${moduleName}: not SVGElement`);

/**
 * バインドを実行する（ノードがSVGElementの場合）
 * @param {import("../binding/Binding.js").BindingManager} bindingManager
 * @param {Node} node 
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function bind(bindingManager, node) {
  /** @type {ViewModel} */
  const viewModel = bindingManager.component.viewModel;
  /** @type {SVGElement} */
  const element = toSVGElement(node);
  /** @type {string} */
  const bindText = element.getAttribute(DATASET_BIND_PROPERTY) ?? undefined;
  (typeof bindText === "undefined") && utils.raise(`${moduleName}: data-bind is not defined`);

  element.removeAttribute(DATASET_BIND_PROPERTY);
  /** @type {string|undefined} */
  const defaultName = undefined;

  // パース
  /** @type {import("../binding/Binding.js").Binding[]} */
  const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, defaultName);

  return bindings;
}
