import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { BindingManager } from "../Binding.js";

export class Branch extends TemplateProperty {
  /** @type {boolean} */
  get isSelectValue() {
    return false;
  }

  /** @type {boolean} */
  get value() {
    return this.binding.children.length > 0;
  }
  set value(value) {
    if (typeof value !== "boolean") utils.raise("Branch: value is not boolean");
    if (this.value !== value) {
      if (value) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.binding.loopContext);
        this.binding.appendChild(bindingManager);
      } else {
        const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
        removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
      }
    } else {
      this.binding.children.forEach(bindings => bindings.applyToNode());
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
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }
}