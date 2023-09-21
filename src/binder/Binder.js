import "../types.js";
import { utils } from "../utils.js";
import { BindToHTMLElement } from "./BindToHTMLElement.js";
import { BindToSVGElement } from "./BindToSVGElement.js";
import { BindToText } from "./BindToText.js";
import { BindToTemplate } from "./BindToTemplate.js";

export class Binder {
  /**
   * バインドを実行する
   * @param {Node[]} nodes
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(nodes, component, context) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(node, component, context) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(node, component, context) :
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(node, component, context) : 
      (node instanceof SVGElement) ? BindToSVGElement.bind(node, component, context) :
      utils.raise(`unknown node type`)
    );
  }

}