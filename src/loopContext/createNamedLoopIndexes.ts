import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { IStatePropertyAccessor } from "../state/types";
import { ILoopIndexes, INamedLoopIndexes } from "./types";

const _pool: INamedLoopIndexes[] = [];

export function createNamedLoopIndexesFromPattern(
  propertyAccessor: IStatePropertyAccessor | undefined = undefined
): INamedLoopIndexes {
  const namedLoopIndexes: INamedLoopIndexes = _pool.pop() ?? new Map();
  if (typeof propertyAccessor === "undefined") return namedLoopIndexes;
  const wildcardPaths = propertyAccessor.patternInfo.wildcardPaths;
  if (wildcardPaths.length > 0 && typeof propertyAccessor.loopIndexes !== "undefined") {
    for(let wi = wildcardPaths.length - 1, loopIndexes: ILoopIndexes | undefined = propertyAccessor.loopIndexes; wi >= 0 ; wi--) {
      if (typeof loopIndexes === "undefined") break;
      namedLoopIndexes.set(wildcardPaths[wi], loopIndexes);
      loopIndexes = loopIndexes.parentLoopIndexes;
    }
  }
  return namedLoopIndexes;
}

export function disposeNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes): void {
  namedLoopIndexes.clear();
  _pool.push(namedLoopIndexes);
}