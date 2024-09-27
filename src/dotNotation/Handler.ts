import { GetDirectSymbol, SetDirectSymbol } from "./symbols";
import { utils } from "../utils";
import { getPropInfo } from "./getPropInfo";
import { GetExpandValuesFn, GetLastIndexesFn, getValueDirectFn, GetValueFn, GetValueWithIndexesFn, GetValueWithoutIndexesFn, IDotNotationHandler, Indexes, IPatternInfo, IPropInfo, IWildcardIndexes, NamedWildcardIndexes, SetExpandValuesFn, setValueDirectFn, SetValueWithIndexesFn, SetValueWithoutIndexesFn, StackIndexes, WithIndexesFn } from "./types";
import { getPatternInfo } from "./getPatternInfo";
import { createWildCardIndexes } from "./createWildCardIndexes";
import { getLastIndexes } from "./getLastIndexes";
import { createNamedWildcardIndexes } from "./createNamedWildcardIndexes";
import { withIndexes } from "./withIndexes";
import { getValue } from "./getValue";
import { getValueWithIndexes } from "./getValueWithIndexes";
import { getValueWithoutIndexes } from "./getValueWithoutIndexes";
import { setValueWithIndexes } from "./setValueWithIndexes";
import { setValueWithoutIndexes } from "./setValueWithoutIndexes";
import { getExpandValues } from "./getExpandValues";
import { setExpandValues } from "./setExpandVaues";
import { getValueDirect } from "./getValueDirect";
import { setValueDirect } from "./setValueDirect";

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
export class Handler implements IDotNotationHandler {
  stackIndexes: StackIndexes = [];
  stackNamedWildcardIndexes: NamedWildcardIndexes[] = [];
  get lastStackIndexes(): Indexes | undefined {
    return this.stackIndexes[this.stackIndexes.length - 1];
  }
  getLastIndexes: GetLastIndexesFn = getLastIndexes(this);
  getValue: GetValueFn = getValue(this);

  getValueWithIndexes: GetValueWithIndexesFn = getValueWithIndexes(this);
  getValueWithoutIndexes: GetValueWithoutIndexesFn = getValueWithoutIndexes(this);

  setValueWithIndexes: SetValueWithIndexesFn = setValueWithIndexes(this);
  setValueWithoutIndexes: SetValueWithoutIndexesFn = setValueWithoutIndexes(this);
  
  getExpandValues: GetExpandValuesFn = getExpandValues(this);
  setExpandValues: SetExpandValuesFn = setExpandValues(this);

  getValueDirect: getValueDirectFn = getValueDirect(this);
  setValueDirect: setValueDirectFn = setValueDirect(this);

  get(target:object, prop:PropertyKey, receiver:object):any {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (prop === GetDirectSymbol) {
        return (prop:string, indexes:number[])=>this.getValueDirect.apply(this, [target, prop, indexes, receiver]);
      }
      if (prop === SetDirectSymbol) {
        return (prop:string, indexes:number[], value:any)=>
          this.setValueDirect.apply(this, [target, prop, indexes, value, receiver]);
      }
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        return (this.lastStackIndexes ?? [])[index - 1];
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        return this.getExpandValues(target, propertyName, receiver);
      }
      return this.getValueWithoutIndexes(target, prop, receiver);
    } while(false);
    return Reflect.get(target, prop, receiver);
  }

  set(target:object, prop:PropertyKey, value:any, receiver:object):boolean {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && prop.startsWith("@@__")) break;
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        utils.raise(`context index(${prop}) is read only`);
      } else if (prop[0] === "@") {
        const propertyName = prop.slice(1);
        this.setExpandValues(target, propertyName, value, receiver);
        return true;
      }
      return this.setValueWithoutIndexes(target, prop, value, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }
}
