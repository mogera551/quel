import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { StateProperty } from "./StateProperty";
import { INewBinding } from "../types";

const regexp = RegExp(/^\$[0-9]+$/);

export class ContextIndex extends StateProperty {
  #index:number;
  get index():number {
    return this.#index;
  }

  get value():number {
    return this.binding.parentContentBindings?.loopContext?.indexes[this.index] ?? utils.raise(`ContextIndex: invalid index ${this.name}`);
  }

  get indexes():number[] {
    return [];
  }

  get indexesString():string {
    return "";
  }

  constructor(binding:INewBinding, name:string, filters:IFilterInfo[]) {
    if (!regexp.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
    super(binding, name, filters);
    this.#index = Number(name.slice(1)) - 1;
  }
}