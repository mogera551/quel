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

  #lastWildCard:string;
  get lastWildCard():string {
    return this.#lastWildCard;
  }

  #level:number;
  get level():number {
    return this.#level;
  }

  get indexes():number[] {
    return this.binding.updator?.namedLoopIndexesStack?.getLoopIndexes(this.lastWildCard)?.values ?? [];
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

  getValue():any {
    return this.state[GetDirectSymbol](this.name, this.indexes);
  }
  setValue(value:any) {
    const setValue = (value:any) => {
      this.state[SetDirectSymbol](this.name, this.indexes, value);
    };
    if (value instanceof MultiValue) {
      const thisValue = this.getValue();
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

  #fileterTexts:IFilterText[];
  #filters?:FilterFunc[];
  get filters() {
    if (typeof this.#filters === "undefined") {
      this.#filters = Filters.create<"output">(this.#fileterTexts, this.binding.outputFilterManager);
    }
    return this.#filters;
  }

  getFilteredValue():any {
    const value = this.getValue();
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

  constructor(binding:IBinding, name:string, filterTexts:IFilterText[]) {
    this.#binding = binding;
    this.#name = name;
    this.#childName = name + ".*";
    this.#propInfo = getPropInfo(name);
    this.#level = this.#propInfo.wildcardCount;
    this.#fileterTexts = filterTexts;
    this.#lastWildCard = this.#propInfo.wildcardPaths[this.#propInfo.wildcardPaths.length - 1];
  }

  /**
   * 初期化処理
   * 特に何もしない
   */
  initialize() {
  }

  getChildValue(index:number) {
    return this.state[GetDirectSymbol](this.#childName , this.indexes.concat(index));
  }

  setChildValue(index:number, value:any) {
    return this.state[SetDirectSymbol](this.#childName , this.indexes.concat(index), value);
  }

  dispose() {
  }
}