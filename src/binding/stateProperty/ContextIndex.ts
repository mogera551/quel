import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { StateProperty } from "./StateProperty";
import { IBinding } from "../types";
import { ILoopIndexes } from "../../loopContext/types";

const regexp = RegExp(/^\$[0-9]+$/);

export class ContextIndex extends StateProperty {
  #index:number;
  get index():number {
    return this.#index;
  }

  getValue():number {
    return this.binding.parentContentBindings?.currentLoopContext?.loopIndexes.at(this.index) ?? utils.raise(`ContextIndex: invalid index ${this.name}`);
  }

  get loopIndexes(): ILoopIndexes | undefined {
    return undefined;

  }
  get indexes():number[] {
    return [];
  }

  constructor(binding:IBinding, name:string, filters:IFilterText[]) {
    if (!regexp.test(name)) utils.raise(`ContextIndex: invalid name ${name}`);
    super(binding, name, filters);
    this.#index = Number(name.slice(1)) - 1;
  }
}