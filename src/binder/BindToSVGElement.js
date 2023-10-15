import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";

const DATASET_BIND_PROPERTY = "data-bind";

/**
 * 
 * @param {Node} node 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`not SVGElement`);

export class BindToSVGElement {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {SVGElement} */
    const element = toSVGElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY);
    /** @type {string|undefined} */
    const defaultName = undefined;

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);

    return bindings;
  }

}