/**
 * @module binding/nodeProperty/Branch
 * @typedef {import("../Binding.js").Binding} Binding
 * @typedef {import("../Binding.js").BindingManager} BindingManager
 */
import "../../types_.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { BindingManager } from "../Binding.js";

export class Branch extends TemplateProperty {
  /** 
   * @return {boolean} having child bindingManager or not
   */
  get value() {
    return this.binding.children.length > 0;
  }
  /** 
   * Set value to bind/unbind child bindingManager
   * @param {boolean} value 
   */
  set value(value) {
    if (typeof value !== "boolean") utils.raise(`Branch: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not boolean`, );
    if (this.value !== value) {
      if (value) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.postCreate();
      } else {
        const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
        removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
      }
    } else {
      this.binding.children.forEach(bindingManager => bindingManager.applyToNode());
    }
  }

  /**
   * 
   * @param {Binding} binding
   * @param {Comment} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}