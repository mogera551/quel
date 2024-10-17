import { GetAccessorSymbol, GetByPropInfoSymbol, GetDirectSymbol, SetAccessorSymbol, SetByPropInfoSymbol, SetDirectSymbol } from "./symbols";
import { utils } from "../utils";
import { FindPropertyCallbackFn, GetExpandValuesFn, GetLastIndexesFn, GetNamedLoopIndexesStackFn, GetValueAccessorFn, GetValueByPropInfoFn, GetValueDirectFn, GetValueFn, GetValueWithIndexesFn, GetValueWithoutIndexesFn, IDotNotationHandler, Indexes, IPropInfo, NamedWildcardIndexes, NotifyCallbackFn, SetExpandValuesFn, SetValueAccessorFn, SetValueByPropInfoFn, SetValueDirectFn, SetValueWithIndexesFn, SetValueWithoutIndexesFn, StackIndexes, StateCache, WithIndexesFn } from "./types";
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
import { ILoopIndexes } from "../loopContext/types";
import { getValueAccessorFn } from "./getAccessorValueFn";
import { setValueAccessorFn } from "./setAccessorValueFn";
import { getValueByPropInfoFn } from "./getValueByPropInfoFn";
import { setValueByPropInfoFn } from "./setValueByPropInfoFn";
import { getPropInfo, PropInfo } from "./getPropInfo";

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

  getValueAccessor: GetValueAccessorFn = getValueAccessorFn(this);
  setValueAccessor: SetValueAccessorFn = setValueAccessorFn(this);

  getValueByPropInfo: GetValueByPropInfoFn = getValueByPropInfoFn(this);
  setValueByPropInfo: SetValueByPropInfoFn = setValueByPropInfoFn(this);
  getNamedLoopIndexesStack: GetNamedLoopIndexesStackFn | undefined;

  clearCache() {
    if (typeof this.cache !== "undefined") {
      this.cache = {};
    }
  }

  findPropertyCallback?: FindPropertyCallbackFn;
  notifyCallback?: NotifyCallbackFn;

  get(target:object, prop:any, receiver:object):any {
    const isPropString = typeof prop === "string";
    do {
      if (isPropString && (prop.startsWith("@@__") || prop === "constructor")) break;
      if (prop === GetByPropInfoSymbol) {
        return (propInfo:IPropInfo):any=>this.getValueByPropInfo(target, propInfo, receiver);
      }
      if (prop === SetByPropInfoSymbol) {
        return (propInfo:IPropInfo, value:any):boolean=>this.setValueByPropInfo(target, propInfo, value, receiver);
      }
      if (!isPropString) break;
      if (prop[0] === "$") {
        const index = Number(prop.slice(1));
        if (isNaN(index)) break;
        const namedLoopIndexesStack = this.getNamedLoopIndexesStack?.() ?? utils.raise("get: namedLoopIndexesStack is undefined");
        const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("get: namedLoopIndexes is undefined");
        const tmpNamedLoopIndexes = Array.from(namedLoopIndexes.values()).filter(v => v.size === (index + 1));
        if (tmpNamedLoopIndexes.length !== 1) {
          utils.raise(`context index(${prop}) is ambiguous or null`);
        }
        return tmpNamedLoopIndexes[0].value;
      }
      const propInfo = getPropInfo(prop);
      return this.getValueByPropInfo(target, propInfo, receiver);
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
      }
      const propInfo = getPropInfo(prop);
      return this.setValueByPropInfo(target, propInfo, value, receiver);
    } while(false);
    return Reflect.set(target, prop, value, receiver);
  }
}
