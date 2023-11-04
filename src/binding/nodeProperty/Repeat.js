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
  /** @type {number} */
  get value() {
    return this.binding.children.length;
  }
  set value(value) {
    if (!Array.isArray(value)) utils.raise("value is not array");
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const newContext = this.binding.viewModelProperty.createChildContext(newIndex);
        const bindingManager = BindingManager.create(this.binding.component, this.template, newContext);
        this.binding.appendChild(bindingManager);
      }
    } else if (this.value > value.length) {
      const removeBindingManagers = this.binding.children.splice(value.length);
      this.binding.children.forEach(applyToNodeFunc);
      removeBindingManagers.forEach(bindingManager => bindingManager.removeFromParent());
    } else {
      this.binding.children.forEach(applyToNodeFunc);
    }
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (name !== "loop") utils.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }
}