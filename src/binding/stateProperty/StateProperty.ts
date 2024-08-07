import { MultiValue } from "../nodeProperty/MultiValue";
import { FilterManager, Filters } from "../../filter/Manager";
import { getPatternNameInfo } from "../../dot-notation/PatternName";
import { getPropertyNameInfo } from "../../dot-notation/PropertyName";
import { Binding } from "../Binding";
import { IBinding, IStateProperty } from "../types";
import { IFilterInfo, FilterFunc } from "../../filter/types";
import { IPatternNameInfo, IPropertyNameInfo } from "../../dot-notation/types";
import { State } from "../../state/types";
import { GetDirectSymbol, SetDirectSymbol } from "../../dot-notation/Const";

export class StateProperty implements IStateProperty {
  get state():State {
    return this.#binding.component.state;
  }

  #name:string;
  get name():string {
    return this.#name;
  }

  #propertyName:IPropertyNameInfo;
  get propertyName():IPropertyNameInfo {
    return this.#propertyName;
  }

  #patternName:IPatternNameInfo;
  get patternName():IPatternNameInfo {
    return this.#patternName;
  }

  #level:number;
  get level():number {
    return this.#level;
  }

  get indexes():number[] {
    const indexes = this.binding.loopContext?.indexes ?? [];
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

  get value():any {
    return this.state[GetDirectSymbol](this.name, this.indexes);
  }
  set value(value:any) {
    const setValue = (value:any) => {
      this.state[SetDirectSymbol](this.name, this.indexes, value);
    };
    if (value instanceof MultiValue) {
      const thisValue = this.value;
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

  get filteredValue():any {
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
  }

  // applyToViewModel()の対象かどうか
  get applicable():boolean {
    return true;
  }

  #binding:IBinding;
  get binding() {
    return this.#binding;
  }

  constructor(binding:IBinding, name:string, filters:IFilterInfo[]) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = Filters.create(filters, binding.component.filters.out) as FilterFunc[];
    this.#propertyName = getPropertyNameInfo(name);
    this.#patternName = getPatternNameInfo(name);
    this.#level = this.#patternName.level;
  }

  assign(binding:Binding, name:string, filters:IFilterInfo[]):IStateProperty {
    this.#binding = binding;
    this.#name = name;
    this.#filters = Filters.create(filters, binding.component.filters.out) as FilterFunc[];
    this.#propertyName = getPropertyNameInfo(name);
    this.#patternName = getPatternNameInfo(name);
    this.#level = this.#patternName.level;
    return this;
  }

  /**
   * 初期化処理
   * 特に何もしない
   */
  initialize() {
  }

  getChildValue(index:number) {
    return this.state[GetDirectSymbol](`${this.name}.*` , this.indexes.concat(index));
  }

  setChildValue(index:number, value:any) {
    return this.state[SetDirectSymbol](`${this.name}.*` , this.indexes.concat(index), value);
  }

  dispose() {
  }
}