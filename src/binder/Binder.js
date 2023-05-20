import "../types.js";
import { utils } from "../utils.js";
import { BindToTemplate } from "./BindToTemplate.js";
import { BindToElement } from "./BindToElement.js";
import { BindToText } from "./BindToText.js";

export class Binder {
  /**
   * 
   * @param {Node[]} nodes
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(nodes, component, context) {
    return nodes.flatMap(node => 
      (node instanceof HTMLTemplateElement) ? BindToTemplate.bind(node, component, context) :
      (node instanceof HTMLElement) ? BindToElement.bind(node, component, context) :
      (node instanceof Comment) ? BindToText.bind(node, component, context) : 
      utils.raise(`unknown node type`)
    );
  }

}