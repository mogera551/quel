import { BindingManager } from "../Binding";
import { TemplateProperty } from "./TemplateProperty";
import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { IBinding, IBindingManager } from "../../@types/binding";

const applyToNodeFunc = (bindingManager:IBindingManager):void => bindingManager.applyToNode();

export class Repeat extends TemplateProperty {
  get loopable():boolean {
    return true;
  }

  get value():number|(any[]) {
    return this.binding.children.length;
  }
  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Repeat: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
    if (this.value as number < value.length) {
      this.binding.children.forEach(applyToNodeFunc);
      for(let newIndex = this.value as number; newIndex < value.length; newIndex++) {
        const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
        this.binding.appendChild(bindingManager);
        bindingManager.postCreate();
      }
    } else if (this.value as number > value.length) {
      const removeBindingManagers = this.binding.children.splice(value.length);
      this.binding.children.forEach(applyToNodeFunc);
      removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
    } else {
      this.binding.children.forEach(applyToNodeFunc);
    }
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (name !== "loop") utils.raise(`Repeat: invalid property name '${name}'`);
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}