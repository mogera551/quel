import "../types.js";
import { Factory } from "../binding/Factory.js";
import * as Parser from "./Parser.js";
import { utils } from "../utils.js";

/**
 * Generate a list of binding objects from a string
 * @param {import("../binding/Binding.js").BindingManager} bindingManager 
 * @param {Node} node node
 * @param {ViewModel} viewModel view model
 * @param {string|undefined} text the string specified in the "data-bind" attribute.
 * @param {string|undefined} defaultName default property name of node
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function parseBindText(bindingManager, node, viewModel, text, defaultName) {
  (typeof text === "undefined") && utils.raise(`BindToDom: text is undefined`);
  if (text.trim() === "") return [];
  return Parser.parse(text, defaultName).map(info => 
    Factory.create(bindingManager, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters));
}
