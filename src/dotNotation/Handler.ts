import { GetDirectSymbol, SetDirectSymbol } from "./symbols";
import { utils } from "../utils";
import { FindPropertyCallbackFn, GetExpandValuesFn, GetLastIndexesFn, GetValueDirectFn, GetValueFn, GetValueWithIndexesFn, GetValueWithoutIndexesFn, IDotNotationHandler, Indexes, NamedWildcardIndexes, NotifyCallbackFn, SetExpandValuesFn, SetValueDirectFn, SetValueWithIndexesFn, SetValueWithoutIndexesFn, StackIndexes, StateCache, WithIndexesFn } from "./types";
import { getLastIndexesFn } from "./getLastIndexesFn";
import { getValueFn } from "./getValueFn";
import { getValueWithIndexesFn } from "./getValueWithIndexesFn";
import { getValueWithoutIndexesFn } from "./getValueWithoutIndexesFn";
import { setValueWithIndexesFn } from "./setValueWithIndexesFn";
import { setValueWithoutIndexesFn } from "./setValueWithoutIndexesFn";
import { getExpandValuesFn } from "./getExpandValuesFn";
import { setExpandValuesFn } from "./setExpandVauesFn";
import { getValueDirectFn } from "./getValueDirectFn";
import { setValueDirectFn } from "./setValueDirectFn";

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
export class Handler implements IDotNotationHandler {
  cache?: StateCache = undefined;
  stackIndexes: StackIndexes = [];
  stackNamedWildcardIndexes: NamedWildcardIndexes[] = [];
  get lastStackIndexes(): Indexes | undefined {
    return this.stackIndexes[this.stackIndexes.length - 1];
  }
  getLastIndexes: GetLastIndexesFn = getLastIndexesFn(this);
  getValue: GetValueFn = getValueFn(this);

  getValueWithIndexes: GetValueWithIndexesFn = getValueWithIndexesFn(this);
  getValueWithoutIndexes: GetValueWithoutIndexesFn = getValueWithoutIndexesFn(this);

  setValueWithIndexes: SetValueWithIndexesFn = setValueWithIndexesFn(this);
  setValueWithoutIndexes: SetValueWithoutIndexesFn = setValueWithoutIndexesFn(this);
  
  getExpandValues: GetExpandValuesFn = getExpandValuesFn(this);
  setExpandValues: SetExpandValuesFn = setExpandValuesFn(this);

  getValueDirect: GetValueDirectFn = getValueDirectFn(this);
  setValueDirect: SetValueDirectFn = setValueDirectFn(this);

  clearCache() {
    if (typeof this.cache !== "undefined") {
      this.cache = {};
    }
  }

  findPropertyCallback?: FindPropertyCallbackFn;
  notifyCallback?: NotifyCallbackFn;

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
