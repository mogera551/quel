import "../types.js";
import { utils } from "../utils.js";
import * as BindToHTMLElement from "./BindToHTMLElement.js";
import * as BindToSVGElement from "./BindToSVGElement.js";
import * as BindToText from "./BindToText.js";
import * as BindToTemplate from "./BindToTemplate.js";

/**
 * Generate a list of binding objects from a list of nodes
 * @param {import("../binding/Binding.js").BindingManager} bindingManager parent binding manager
 * @param {SelectedNode[]} selectedNodes selected node list having data-bind attribute
 * @returns {import("../binding/Binding.js").Binding[]} generate a list of binding objects 
 */
export function bind(bindingManager, selectedNodes) {
  return selectedNodes.flatMap(selectedNode => 
    (selectedNode.node instanceof Comment && selectedNode.node.textContent[2] == ":") ? BindToText.bind(bindingManager, selectedNode) : 
    (selectedNode.node instanceof HTMLElement) ? BindToHTMLElement.bind(bindingManager, selectedNode) :
    (selectedNode.node instanceof Comment && selectedNode.node.textContent[2] == "|") ? BindToTemplate.bind(bindingManager, selectedNode) : 
    (selectedNode.node instanceof SVGElement) ? BindToSVGElement.bind(bindingManager, selectedNode) :
    utils.raise(`Binder: unknown node type`)
  );
}
