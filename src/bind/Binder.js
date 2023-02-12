import "../types.js";
import utils from "../utils.js";
import BindInfo from "./BindInfo.js";
import Selector from "./Selector.js";
import BindToTemplate from "./BindToTemplate.js";
import BindToElement from "./BindToElement.js";
import BindToText from "./BindToText.js";

export default class {
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement 
   * @param {ViewModel} viewModel
   * @param {string[]?} indexes
   * @returns {BindInfo[]}
   */
  static bind(template, rootElement, viewModel, indexes = []) {
    const nodes = Selector.getTargetNodes(template, rootElement);
    return nodes.flatMap(node => 
      (node instanceof HTMLTemplateElement) ? BindToTemplate.bind(node, viewModel, indexes) :
      (node instanceof HTMLElement) ? BindToElement.bind(node, viewModel, indexes) :
      (node instanceof Comment) ? BindToText.bind(node, viewModel, indexes) : utils.raise(`unknown node type`)
    );
  }

}