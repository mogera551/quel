import { utils } from "../../utils";
import { IFilterInfo } from "../../@types/filter";
import { StateProperty } from "./StateProperty";
import { Binding } from "../Binding";

const regexp = RegExp(/^\$[0-9]+$/);

export class ContextIndex extends StateProperty {
  get index():number {
    return Number(this.name.slice(1)) - 1;
  }

  get value():any {
    return this.binding.loopContext.allIndexes[this.index];
  }

  get indexes():number[] {
    return [];
  }

  get indexesString():string {
    return "";
  }

  constructor(binding:Binding, name:string, filters:IFilterInfo[]) {
    if (!regexp.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
    super(binding, name, filters);
  }
}