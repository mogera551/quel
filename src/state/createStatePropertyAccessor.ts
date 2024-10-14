import { getPropInfo } from "../dotNotation/getPropInfo";
import { IPatternInfo } from "../dotNotation/types";
import { createLoopIndexes } from "../loopContext/createLoopIndexes";
import { ILoopIndexes, INamedLoopIndexesStack } from "../loopContext/types";
import { utils } from "../utils";
import { IStatePropertyAccessor } from "./types";

class StatePropertyAccessor implements IStatePropertyAccessor{
  #pattern: string;
  #patternInfo: IPatternInfo | undefined;
  #loopIndexes: ILoopIndexes | undefined;
  #key: string | undefined;
  get pattern(): string {
    return this.#pattern;
  }
  get patternInfo(): IPatternInfo {
    if (typeof this.#patternInfo === "undefined") {
      this.#patternInfo = getPropInfo(this.#pattern);
    }
    return this.#patternInfo;
  }
  get loopIndexes(): ILoopIndexes | undefined {
    return this.#loopIndexes;
  }
  get key() {
    if (typeof this.#key === "undefined") {
      this.#key = this.pattern + "\t" + (this.loopIndexes?.toString() ?? "");
    }
    return this.#key;
  }
  constructor(pattern: string, loopIndexes: ILoopIndexes | undefined = undefined) {
    this.#pattern = pattern;
    this.#loopIndexes = loopIndexes;
  }
}

/**
 * State内でのプロパティのアクセスを想定している
 * "@"で始まるプロパティは想定していない
 * 
 * @param name State
 */
export function createStatePropertyAccessorFromState(name: string, namedLoopIndexesStack: INamedLoopIndexesStack) {
  name[0] === "@" && utils.raise(`Cannot access to the property starting with "@" in the state.`);
  const propInfo = getPropInfo(name);
  if (propInfo.wildcardCount === 0) {
    return new StatePropertyAccessor(name);
  }
  if (propInfo.allComplete) {
    return new StatePropertyAccessor(propInfo.pattern, propInfo.wildcardLoopIndexes);
  }
  const indexes = namedLoopIndexesStack.getLoopIndexes(propInfo.pattern) ?? utils.raise(`createStatePropertyAccessorFromState: loopIndexes is not found.`);
  const iterator = indexes?.forward();
  const wildcardIterator = propInfo.wildcardLoopIndexes?.forward() ?? utils.raise(`createStatePropertyAccessorFromState: wildcardLoopIndexes is not found`);
  let loopIndexes: ILoopIndexes | undefined;
  while(true) {
    let wildcardNext = wildcardIterator.next();
    if (wildcardNext.done === true) break;
    let next = iterator?.next();
    let indexValue = wildcardNext.value ?? next?.value ?? utils.raise(`createStatePropertyAccessorFromBinding: indexValue is not found.`);
    loopIndexes = createLoopIndexes(loopIndexes, indexValue);
  }
  return new StatePropertyAccessor(propInfo.pattern, loopIndexes);
}

/**
 * BindingからStateのプロパティのアクセスを想定している
 * "@"で始まるプロパティは想定していない
 * Bindingのツリー構造から既にインデックスは取得できている
 * nameには、ワイルドカード以外にインデックスが含まれる可能性がある
 * @param name 
 * @param indexes 
 */
export function createStatePropertyAccessorFromBinding(name: string, loopIndexes: ILoopIndexes | undefined = undefined) {
  (name[0] === "@" || name[0] === "$") && utils.raise(`Cannot access to the property starting with "@" or "$"  in the state.`);
  const propInfo = getPropInfo(name);
  // 
  if (propInfo.wildcardCount === 0) {
    return new StatePropertyAccessor(name);
  }
  if (propInfo.allComplete) {
    return new StatePropertyAccessor(propInfo.pattern, propInfo.wildcardLoopIndexes);
  }
  if (propInfo.allIncomplete) {
    return new StatePropertyAccessor(name, loopIndexes);
  }
  const iterator = loopIndexes?.forward();
  const wildcardIterator = propInfo.wildcardLoopIndexes?.forward() ?? utils.raise(`createStatePropertyAccessorFromState: wildcardLoopIndexes is not found`);
  let tmpLoopIndexes: ILoopIndexes | undefined;
  while(true) {
    let wildcardNext = wildcardIterator.next();
    if (wildcardNext.done === true) break;
    let next = iterator?.next();
    let indexValue = wildcardNext.value ?? next?.value ?? utils.raise(`createStatePropertyAccessorFromBinding: indexValue is not found.`);
    tmpLoopIndexes = createLoopIndexes(loopIndexes, indexValue);
  }
  return new StatePropertyAccessor(propInfo.pattern, tmpLoopIndexes);
}

export function createStatePropertyAccessor(
  pattern: string, 
  loopIndexes: ILoopIndexes | undefined
): IStatePropertyAccessor {
  return new StatePropertyAccessor(pattern, loopIndexes);
}