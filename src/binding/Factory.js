import "../types.js";
import { utils } from "../utils.js";
import { Binding } from "./Binding.js";
import { Repeat } from "./nodePoperty/Repeat.js";
import { Branch } from "./nodePoperty/Branch.js";
import { ViewModelProperty } from "./ViewModelProperty.js";
import { NodeProperty } from "./nodePoperty/NodeProperty.js";
import { ElementClassName } from "./nodePoperty/ElementClassName.js"
import { Checkbox } from "./nodePoperty/Checkbox.js";
import { Radio } from "./nodePoperty/Radio.js";
import { ElementEvent } from "./nodePoperty/ElementEvent.js";
import { ElementClass } from "./nodePoperty/ElementClass.js";
import { ElementAttribute } from "./nodePoperty/ElementAttribute.js";
import { ElementStyle } from "./nodePoperty/ElementStyle.js";
import { ElementProperty } from "./nodePoperty/ElementProperty.js";

const classOfNodePropertyByNameByIsComment = {
  true: {
    "if": Branch,
    "loop": Repeat,
  },
  false: {
    "class": ElementClassName,
    "checkbox": Checkbox,
    "radio": Radio,
  }
};

const classOfNodePropertyByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
};

export class Factory {

  /**
   * 
   * @param {Component} component 
   * @param {Node} node 
   * @param {string} nodePropertyName 
   * @param {ViewModel} viewModel 
   * @param {string} viewModelPropertyName 
   * @param {Filter[]} filters 
   * @param {ContextInfo} context 
   * @returns {Binding}
   */
  static create(component, node, nodePropertyName, viewModel, viewModelPropertyName, filters, context) {
    /** @type {typeof NodeProperty|undefined} */
    let classOfNodeProperty = undefined;
    const classOfViewModelProperty = ViewModelProperty;

    do {
      const isComment = node instanceof Comment;
      classOfNodeProperty = classOfNodePropertyByNameByIsComment[isComment][nodePropertyName];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (isComment) utils.raise(`unknown node property ${nodePropertyName}`);
      const nameElements = nodePropertyName.split(".");
      classOfNodeProperty = classOfNodePropertyByFirstName[nameElements[0]];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (node instanceof Element) {
        if (nodePropertyName.startsWith("on")) {
          classOfNodeProperty = ElementEvent;
        } else {
          classOfNodeProperty = ElementProperty;
        }
      } else {
        classOfNodeProperty = NodeProperty;
      }
    } while(false);
    /** @type {Binding} */
    const binding = new Binding(
      component, context,
      node, nodePropertyName, classOfNodeProperty, 
      viewModel, viewModelPropertyName, classOfViewModelProperty, 
      filters);
    binding.initialize();

    return binding;
  }
}