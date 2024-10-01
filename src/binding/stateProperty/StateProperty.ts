import { IBinding, IStateProperty } from "../types";
import { IFilterText, FilterFunc } from "../../filter/types";
import { GetDirectSymbol, SetDirectSymbol } from "../../dotNotation/symbols";
import { MultiValue } from "../nodeProperty/MultiValue";
import { FilterManager, Filters } from "../../filter/Manager";
import { CleanIndexes, IPropInfo } from "../../dotNotation/types";
import { getPropInfo } from "../../dotNotation/getPropInfo";
import { IStateProxy } from "../../state/types";
import { utils } from "../../utils";
import { IUpdator } from "../../updator/types";

export class StateProperty implements IStateProperty {
  get state(): IStateProxy {
    return this.#binding.state ?? utils.raise("StateProperty: state is undefined");
  }

  #name:string;
  get name():string {
    return this.#name;
  }

  #childName: string;
  get childName(): string {
    return this.#childName;
  }

  #propInfo:IPropInfo;
  get propInfo():IPropInfo {
    return this.#propInfo;
  }

  #level:number;
  get level():number {
    return this.#level;
  }

  get indexes():number[] {
    const indexes = this.binding.parentContentBindings?.currentLoopContext?.indexes ?? [];
    return indexes.length === this.level ? indexes : indexes.slice(0 , this.level);
  }

  get indexesString():string {
    return this.indexes.toString();
  }

  get key():string {
    return this.name + "\t" + this.indexesString;
  }

  #oldKey:string = "";
  get oldKey():string {
    return this.#oldKey;
  }

  get isChagedKey():boolean {
    return this.#oldKey !== this.key;
  }

  getKey():string {
    this.#oldKey = this.key;
    return this.key;
  }

  getValue(updator:IUpdator):any {
    let indexes = updator.namedLoopIndexes[this.name];
    if (typeof indexes === "undefined") indexes = this.indexes;
    return this.state[GetDirectSymbol](this.name, indexes);
  }
  setValue(updator:IUpdator, value:any) {
    let indexes = updator.namedLoopIndexes[this.name];
    if (typeof indexes === "undefined") indexes = this.indexes;
    const setValue = (value:any) => {
      this.state[SetDirectSymbol](this.name, indexes, value);
    };
    if (value instanceof MultiValue) {
      const thisValue = this.getValue(updator);
      if (Array.isArray(thisValue)) {
        const setOfThisValue = new Set(thisValue);
        value.enabled ? setOfThisValue.add(value.value) : setOfThisValue.delete(value.value);
        setValue(Array.from(setOfThisValue));
      } else {
        setValue(value.enabled ? value.value : undefined);
      }
    } else {
      setValue(value);
    }
  }

  #filters:FilterFunc[];
  get filters() {
    return this.#filters;
  }

  getFilteredValue(updator:IUpdator):any {
    const value = this.getValue(updator);
    return this.filters.length === 0 ? value : FilterManager.applyFilter<"output">(value, this.filters);
  }

  // setValueToState()の対象かどうか
  get applicable():boolean {
    return true;
  }

  #binding:IBinding;
  get binding() {
    return this.#binding;
  }

  constructor(binding:IBinding, name:string, filters:IFilterText[]) {
    this.#binding = binding;
    this.#name = name;
    this.#childName = name + ".*";
    this.#filters = Filters.create<"output">(filters, binding.outputFilterManager);
    this.#propInfo = getPropInfo(name);
    this.#level = this.#propInfo.wildcardCount;
  }

  /**
   * 初期化処理
   * 特に何もしない
   */
  initialize() {
  }

  getChildValue(index:number, indexes: number[] | undefined) {
    if (typeof indexes === "undefined") indexes = this.indexes;
    return this.state[GetDirectSymbol](this.#childName , indexes.concat(index));
  }

  setChildValue(index:number, value:any, indexes: number[] | undefined) {
    if (typeof indexes === "undefined") indexes = this.indexes;
    return this.state[SetDirectSymbol](this.#childName , indexes.concat(index), value);
  }

  dispose() {
  }
}