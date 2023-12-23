import { BindingManager } from "../Binding.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { LoopContext } from "../../loopContext/LoopContext.js";

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
    if (!Array.isArray(value)) utils.raise("Repeat: value is not array");
    if (this.value < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value; newIndex < value.length; newIndex++) {
        const loopContext = new LoopContext(this.binding.viewModelProperty.name, newIndex, this.binding.loopContext);
        const bindingManager = BindingManager.create(this.binding.component, this.template, loopContext);
        this.binding.appendChild(bindingManager);
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
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}