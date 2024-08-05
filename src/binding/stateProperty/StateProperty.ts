import "../../types.js";
import { MultiValue } from "../nodeProperty/MultiValue";
import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../../Symbols.js";
import { FilterInfo, FilterManager, Filters, FilterFunc } from "../../filter/Manager";
import { getPatternNameInfo } from "../../dot-notation/PatternName";
import { PropertyNameInfo } from "../../dot-notation/PropertyNameInfo";
import { PatternNameInfo } from "../../dot-notation/PatternNameInfo";
import { getPropertyNameInfo } from "../../dot-notation/PropertyName";
import { Binding } from "../Binding";

export class StateProperty {
  /** @type { State } */
  get state():State {
    return this.#binding.component.state;
  }

  #name:string;
  get name() {
    return this.#name;
  }

  #propertyName:PropertyNameInfo;
  get propertyName() {
    return this.#propertyName;
  }

  #patternName:PatternNameInfo;
  get patternName() {
    return this.#patternName;
  }

  #level;
  get level() {
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
  get oldKey() {
    return this.#oldKey;
  }

  get isChagedKey():boolean {
    return this.#oldKey !== this.key;
  }

  getKey():string {
    this.#oldKey = this.key;
    return this.key;
  }

  /** @type {any} */
  get value() {
    return this.state[Symbols.directlyGet](this.name, this.indexes);
  }
  set value(value) {
    const setValue = (value:any) => {
      this.state[Symbols.directlySet](this.name, this.indexes, value);
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

  /** @type {any} */
  get filteredValue() {
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
  }

  /** @type {boolean} applyToViewModel()の対象かどうか */
  get applicable() {
    return true;
  }

  /** @type {import("../Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  constructor(binding:Binding, name:string, filters:FilterInfo[]) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = Filters.create(filters, binding.component.filters.out);
    this.#propertyName = getPropertyNameInfo(name);
    this.#patternName = getPatternNameInfo(name);
    this.#level = this.#patternName.level;
  }

  assign(binding:Binding, name:string, filters:FilterInfo[]):StateProperty {
    this.#binding = binding;
    this.#name = name;
    this.#filters = Filters.create(filters, binding.component.filters.out);
    this.#propertyName = getPropertyNameInfo(name);
    this.#patternName = getPatternNameInfo(name);
    this.#level = this.#patternName.level;
    return this;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  getChildValue(index:number) {
    return this.state[Symbols.directlyGet](`${this.name}.*` , this.indexes.concat(index));
  }

  setChildValue(index:number, value:any) {
    return this.state[Symbols.directlySet](`${this.name}.*` , this.indexes.concat(index), value);
  }

  dispose() {
  }
}