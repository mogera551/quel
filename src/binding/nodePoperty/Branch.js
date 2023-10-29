import { TemplateProperty } from "./TemplateProperty.js";
import { utils } from "../../utils.js";
import { Bindings } from "../Binding.js";
import { Context } from "../../context/Context.js";
import { Templates } from "../../view/Templates.js";

export class Branch extends TemplateProperty {
  /** @type {boolean} */
  get value() {
    return this.binding.children.length > 0;
  }
  set value(value) {
    if (typeof value !== "boolean") utils.raise("value is not boolean");
    if (this.value !== value) {
      if (value) {
        const bindings = new Bindings(this.binding.component, this.template, Context.clone(this.binding.context));
        this.binding.appendChild(bindings);
      } else {
        const removeListOfBindings = this.binding.children.splice(0, this.binding.children.length);
        removeListOfBindings.forEach(bindings => bindings.removeFromParent());
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
    if (name !== "if") utils.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

}