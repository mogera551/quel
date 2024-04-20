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
    if (!Array.isArray(value)) utils.raise("Repeat: value is not array");
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const [ name, index ] = [this.binding.viewModelProperty.name, newIndex]; 
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding, { name, index });
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
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   * @param {Object<string,EventFilterFunc>} eventFilterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs, eventFilterFuncs) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters, filterFuncs, eventFilterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}