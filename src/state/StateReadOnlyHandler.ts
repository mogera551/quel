import { getPatternNameInfo } from "../dot-notation/PatternName";
import { utils } from "../utils";
import { StateCache } from "./Cache";
import { AccessorPropertiesSymbol } from "./Const";
import { StateBaseHandler } from "./StateBaseHandler";
import { Callback } from "./Callback";
import { Api } from "./Api";

const SpecialProp:Map<string,string> = new Map();

export class StateReadOnlyHandler extends StateBaseHandler {
  #cache = new StateCache;
  get cache() {
    return this.#cache;
  }

  clearCache() {
    this.#cache.clear();
  }

  getByPatternNameAndIndexes(target:State, {patternName, indexes}:{patternName:string, indexes:number[]}, receiver:any):any {
    const patternNameInfo = getPatternNameInfo(patternName);
    if (!patternNameInfo.isPrimitive) {
      !this.dependencies.hasDefaultProp(patternName) && 
        this.dependencies.addDefaultProp(patternName);
    }
    if (SpecialProp.has(patternNameInfo.name)) {
      return undefined; // SpecialProp.get(this.component, target, patternNameInfo.name);
    } else {
      if (!patternNameInfo.isPrimitive || this.accessorProperties.has(patternName)) {
          // プリミティブじゃないもしくはアクセサプロパティ場合、キャッシュから取得する
        const indexesString = patternNameInfo.level > 0 ? (
          patternNameInfo.level === this.lastIndexes.length ? 
            indexes.toString() :
            indexes.slice(0, patternNameInfo.level).join(",")
        ) : "";
        const cachedValue = this.#cache.get(patternName, indexesString);
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

  setByPatternNameAndIndexes(target:State, {patternName, indexes, value}:{patternName:string, indexes:number[], value:any}, receiver:any):boolean {
    utils.raise("StateReadOnlyHandler: State is read only");
    return false;
  }

  get(target:State, prop:PropertyKey, receiver:any):any {
    const isSymbol = typeof prop === "symbol";
    if (isSymbol) {
      if (Callback.has(prop as symbol)) {
        return Callback.get(target, receiver, this, prop as symbol);
      } else if (Api.has(prop as symbol)) {
        return Api.get(target, receiver, this, prop as symbol);
      }
    }
    return super.get(target, prop, receiver);
  }

  set(target:State, prop:PropertyKey, value:any, receiver:any):boolean {
    utils.raise("StateReadOnlyHandler: State is read only");
    return false;
  }

}