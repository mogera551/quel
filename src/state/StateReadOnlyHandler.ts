import { getPatternNameInfo } from "../dot-notation/PatternName";
import { utils } from "../utils";
import { StateCache } from "./Cache";
import { AccessorPropertiesSymbol } from "./Const";
import { StateBaseHandler } from "./StateBaseHandler";
import { Callback } from "./Callback";
import { Api } from "./Api";
import { SpecialProp } from "./SpecialProp";
import { IState } from "./types";

export class StateReadOnlyHandler extends StateBaseHandler {
  #cache = new StateCache;
  get cache() {
    return this.#cache;
  }

  clearCache() {
    this.#cache.clear();
  }

  getByPatternNameAndIndexes(target:Object, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:IState):any {
    const patternNameInfo = getPatternNameInfo(patternName);
    if (!patternNameInfo.isPrimitive) {
      !this.dependencies.hasDefaultProp(patternName) && 
        this.dependencies.addDefaultProp(patternName);
    }
    if (SpecialProp.has(patternNameInfo.name)) {
      return SpecialProp.get(this.component, target, patternName);
    } else {
      if (!patternNameInfo.isPrimitive || this.accessorProperties.has(patternName)) {
          // プリミティブじゃないもしくはアクセサプロパティ場合、キャッシュから取得する
        const indexesString = patternNameInfo.level > 0 ? (
          patternNameInfo.level === indexes.length ? 
            indexes.toString() :
            indexes.slice(0, patternNameInfo.level).join(",")
        ) : "";
        const cachedValue = this.cache.get(patternName, indexesString);
        if (typeof cachedValue !== "undefined") return cachedValue;
        if (this.cache.has(patternName, indexesString)) return undefined;
        const value = super.getByPatternNameAndIndexes(target, {patternName, indexes}, receiver);
        this.cache.set(patternName, indexesString, value);
        return value;
      } else {
        return super.getByPatternNameAndIndexes(target, {patternName, indexes}, receiver);
      }
    }

  }

  setByPatternNameAndIndexes(target:Object, {patternName, indexes, value}:{patternName:string, indexes:number[], value:IState}, receiver:any):boolean {
    utils.raise("StateReadOnlyHandler: State is read only");
  }

  get(target:Object, prop:PropertyKey, receiver:IState):any {
    if (typeof prop === "symbol") {
      const supportCallbackSymbol = Callback.getSupportSymbol(prop);
      if (typeof supportCallbackSymbol !== "undefined") {
        return Callback.get(target, receiver, this, supportCallbackSymbol);
      }
      const supportApiSymbol = Api.getSupportSymbol(prop);
      if (typeof supportApiSymbol !== "undefined") {
        return Api.get(target, receiver, this, supportApiSymbol);
      }
    }
    return super.get(target, prop, receiver);
  }

  set(target:Object, prop:PropertyKey, value:any, receiver:any):boolean {
    utils.raise("StateReadOnlyHandler: State is read only");
  }

}