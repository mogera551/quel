import "../types.js";
import { utils } from "../utils.js";
import * as BindToHTMLElement from "./BindToHTMLElement.js";
import * as BindToSVGElement from "./BindToSVGElement.js";
import * as BindToText from "./BindToText.js";
import * as BindToTemplate from "./BindToTemplate.js";

/**
 * Generate a list of binding objects from a list of nodes
 * @param {import("../binding/Binding.js").BindingManager} bindingManager parent binding manager
 * @param {Node[]} nodes node list having data-bind attribute
 * @returns {import("../binding/Binding.js").Binding[]} generate a list of binding objects 
 */
export function bind(bindingManager, nodes) {
  return nodes.flatMap(node => 
    (node instanceof Comment && node.textContent[2] == ":") ? BindToText.bind(bindingManager, node) : 
    (node instanceof HTMLElement) ? BindToHTMLElement.bind(bindingManager, node) :
    (node instanceof Comment && node.textContent[2] == "|") ? BindToTemplate.bind(bindingManager, node) : 
    (node instanceof SVGElement) ? BindToSVGElement.bind(bindingManager, node) :
    utils.raise(`Binder: unknown node type`)
  );
}
