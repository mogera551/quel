import "../types.js";
import { utils } from "../utils.js";
import { Binding } from "./Binding.js";
import { BranchBinding } from "./BranchBinding.js";
import { RepeatBinding } from "./RepeatBinding.js";
import { ViewModelProperty } from "./ViewModelProperty.js";
import { NodeProperty } from "./nodePoperty/NodeProperty.js";
import { TemplateProperty } from "./nodePoperty/TemplateProperty.js";
import { ElementClassName } from "./nodePoperty/ElementClassName.js"
import { Checkbox } from "./nodePoperty/Checkbox.js";
import { Radio } from "./nodePoperty/Radio.js";
import { ElementEvent } from "./nodePoperty/ElementEvent.js";
import { ElementClass } from "./nodePoperty/ElementClass.js";
import { ElementAttribute } from "./nodePoperty/ElementAttribute.js";
import { ElementStyle } from "./nodePoperty/ElementStyle.js";
import { ElementProperty } from "./nodePoperty/ElementProperty.js";

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
    /** @type {typeof Binding} */
    let classOfBinding = undefined;
    /** @type {typeof NodeProperty} */
    let classOfNodeProperty = undefined;
    const classOfViewModelProperty = ViewModelProperty;

    if (node instanceof Comment) {
      if (nodePropertyName === "if") {
        classOfNodeProperty = TemplateProperty;
        classOfBinding = BranchBinding;
      } else if (nodePropertyName === "loop") {
        classOfNodeProperty = TemplateProperty;
        classOfBinding = RepeatBinding;
      } else {
        utils.raise(`unknown node property ${nodePropertyName}`);
      }
    } else {
      classOfBinding = Binding;
      if (nodePropertyName === "class") {
        classOfNodeProperty = ElementClassName;
      } else if (nodePropertyName === "checkbox") {
        classOfNodeProperty = Checkbox;
      } else if (nodePropertyName === "radio") {
        classOfNodeProperty = Radio;
      } else if (nodePropertyName.startsWith("on")) {
        classOfNodeProperty = ElementEvent;
      } else if (nodePropertyName.startsWith("class.")) {
        classOfNodeProperty = ElementClass;
      } else if (nodePropertyName.startsWith("attr.")) {
        classOfNodeProperty = ElementAttribute;
      } else if (nodePropertyName.startsWith("style.")) {
        classOfNodeProperty = ElementStyle;
      } else if (node instanceof Element) {
        classOfNodeProperty = ElementProperty;
      } else {
        classOfNodeProperty = NodeProperty;
      }
    }
    /** @type {NodeProperty} */
    const nodeProperty = new classOfNodeProperty(node, nodePropertyName, filters, component.filters.in);
    /** @type {ViewModelProperty}  */
    const viewModelProperty = new classOfViewModelProperty(viewModel, viewModelPropertyName, context, filters, component.filters.out);
    /** @type {Binding} */
    const binding = new classOfBinding(component, nodeProperty, viewModelProperty);
    binding.initialize();

    return binding;
  }
}