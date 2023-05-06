import "../types.js";
import  { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";

const DATASET_BIND_PROPERTY = "bind";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLTemplateElement}
 */
const toHTMLTemplateElement = node => (node instanceof HTMLTemplateElement) ? node : utils.raise("not HTMLTemplateElement");

export class BindToTemplate extends BindToDom {
  /**
   * 
   * @param {Node} node 
   * @param {import("../component/Component.js").Component} component
   * @param {import("../bindInfo/BindInfo.js").BindInfo?} contextBind 
   * @param {number[]} contextIndexes
   * @returns {import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  static bind(node, component, contextBind, contextIndexes) {
    const viewModel = component.viewModel;
    const template = toHTMLTemplateElement(node);
    const bindText = template.dataset[DATASET_BIND_PROPERTY];

    // パース
    const parseBindText = this.parseBindText(node, component, viewModel, contextBind, contextIndexes);
    let binds = parseBindText(bindText, "");
    binds = binds.length > 0 ? [ binds[0] ] : [];
    binds.forEach(this.applyUpdateNode);

    return binds;
  }
}