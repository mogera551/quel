import { NodeProperty } from "./NodeProperty.js";
import { TemplateProperty } from "./TemplateProperty.js";
import { Templates } from "../../view/Templates.js";
import { utils } from "../../utils.js";
import { Bindings } from "../Binding.js";
import { Context } from "../../context/Context.js";

class Branch extends TemplateProperty {
  /** @type {boolean} */
  get value() {
    return this.binding.children.length > 0;
  }
  set value(value) {
    if (typeof value !== "boolean") utils.raise("value is not boolean");
    if (this.value !== value) {
      if (value) {
        const {uuid} = this;
        const { component, context } = this.binding;
        const bindings = new Bindings(component, uuid, Context.clone(context));
        this.binding.children.push(bindings);
      } else {
        const bindings = this.binding.children.splice(0, this.binding.children.length);
      }
    } else {
      this.binding.children.forEach(bindings => bindings.applyToNode());
    }

  }


  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (name !== "if") utils.raise(`invalid property name ${name}`);
    super(binding, node, name, filters, filterFuncs);
  }

}