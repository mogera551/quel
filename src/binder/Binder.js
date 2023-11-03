import "../types.js";
import { utils } from "../utils.js";
import { BindToHTMLElement } from "./BindToHTMLElement.js";
import { BindToSVGElement } from "./BindToSVGElement.js";
import { BindToText } from "./BindToText.js";
import { BindToTemplate } from "./BindToTemplate.js";

export class Binder {
  /**
   * DOMのプロパティとViewModelプロパティのバインドを行う
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node[]} nodes
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, nodes) {
    return nodes.flatMap(node => 
      (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(bindingManager, node) : 
      (node instanceof HTMLElement) ? BindToHTMLElement.bind(bindingManager, node) :
      (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(bindingManager, node) : 
      (node instanceof SVGElement) ? BindToSVGElement.bind(bindingManager, node) :
      utils.raise(`unknown node type`)
    );
  }

}