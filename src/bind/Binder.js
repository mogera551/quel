import "../types.js";
import utils from "../utils.js";
import BindInfo from "../bindInfo/BindInfo.js";
import Selector from "./Selector.js";
import BindToTemplate from "./BindToTemplate.js";
import BindToElement from "./BindToElement.js";
import BindToText from "./BindToText.js";
import Component from "../component/Component.js";

export default class {
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement 
   * @param {Component} component
   * @param {number[]?} indexes
   * @returns {BindInfo[]}
   */
  static bind(template, rootElement, component, indexes = []) {
    const nodes = Selector.getTargetNodes(template, rootElement);
    return nodes.flatMap(node => 
      (node instanceof HTMLTemplateElement) ? BindToTemplate.bind(node, component, indexes) :
      (node instanceof HTMLElement) ? BindToElement.bind(node, component, indexes) :
      (node instanceof Comment) ? BindToText.bind(node, component, indexes) : 
      utils.raise(`unknown node type`)
    );
  }

}