import { TemplateProperty } from "./TemplateProperty";
import { utils } from "../../utils";
import { BindingManager } from "../Binding";
import { IBinding } from "../../@types/binding";
import { IFilterInfo } from "../../@types/filter";

export class Branch extends TemplateProperty {
  get value():boolean {
    return this.binding.children.length > 0;
  }

  /** 
   * Set value to bind/unbind child bindingManager
   */
  set value(value:any) {
    if (typeof value !== "boolean") utils.raise(`Branch: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not boolean`, );
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

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== "if") utils.raise(`Branch: invalid property name ${name}`);
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}