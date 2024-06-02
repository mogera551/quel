import { BindingManager } from "../Binding.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";

/**
 * 
 * @param {BindingManager} bindingManager 
 * @returns 
 */
const applyToNodeFunc = bindingManager => bindingManager.applyToNode();

export class Repeat extends TemplateProperty {
  /** @type {boolean} */
  get loopable() {
    return true;
  }

  /** @type {number} */
  get value() {
    return this.binding.children.length;
  }
  /** @param {Array} value */
  set value(value) {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`);
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.registerBindingsToSummary();
        bindingManager.applyToNode();
      }
    } else if (this.value > value.length) {
      const removeBindingManagers = this.binding.children.splice(value.length);
      this.binding.children.forEach(applyToNodeFunc);
      removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
    } else {
      this.binding.children.forEach(applyToNodeFunc);
    }
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}