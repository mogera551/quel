import "../types.js";
import { utils } from "../utils.js";
import { Binding } from "./Binding.js";

export class Factory {
  /**
   * 
   * @param {Component} component 
   * @param {Node} node 
   * @param {string} nodeProperty 
   * @param {ViewModel} viewModel 
   * @param {string} viewModelProperty 
   * @param {Filter[]} filters 
   * @param {ContextInfo} context 
   * @returns {Binding}
   */
  static create(component, node, nodeProperty, viewModel, viewModelProperty, filters, context) {
    if (node instanceof Comment) {
      if (nodeProperty === "if") {
        // BranchBinding
      } else if (nodeProperty === "loop") {
        // RepeatBinding
      } else {
        // fail
      }
    } else {
      const nameElements = nodeProperty.split(".");
      if (nameElements.length === 0) {
        if (nodeProperty === "class") {
          // ElementClassName
        } else if (nodeProperty === "checkbox") {
          // Checkbox
        } else if (nodeProperty === "radio") {
          // Radio
        } else if (nodeProperty.startsWith("on")) {
          // ElementEvent
        } else {
          // NodeProperty
        }

      } else {
        if (nameElements[0] === "class") {
          // ElementClass
        } else if (nameElements[0] === "attr") {
          // ElementAttribute
        } else if (nameElements[0] === "style") {
          // ElementStyle
        }

      }
    }

  }
}