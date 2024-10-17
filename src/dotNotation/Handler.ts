import { GetByPropInfoSymbol, SetByPropInfoSymbol } from "./symbols";
import { utils } from "../utils";
import { FindPropertyCallbackFn, GetExpandValuesFn, GetNamedLoopIndexesStackFn, GetValueByPropInfoFn, GetValueFn, IDotNotationHandler, IPropInfo, NotifyCallbackFn, SetExpandValuesFn, SetValueByPropInfoFn, StateCache } from "./types";
import { getValueFn } from "./getValueFn";
import { getExpandValuesFn } from "./getExpandValuesFn";
import { setExpandValuesFn } from "./setExpandVauesFn";
import { getValueByPropInfoFn } from "./getValueByPropInfoFn";
import { setValueByPropInfoFn } from "./setValueByPropInfoFn";
import { getPropInfo } from "./getPropInfo";

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
export class Handler implements IDotNotationHandler {
  cache?: StateCache = undefined;
  getValue: GetValueFn = getValueFn(this);
  getExpandValues: GetExpandValuesFn = getExpandValuesFn(this);
  setExpandValues: SetExpandValuesFn = setExpandValuesFn(this);
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
        const tmpNamedLoopIndexes = Array.from(namedLoopIndexes.values()).filter(v => v.size === index);
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
