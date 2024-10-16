import { IStatePropertyAccessor } from "../state/types";
import { utils } from "../utils";
import { ILoopIndexes, INamedLoopIndexes } from "./types";

const _pool: INamedLoopIndexes[] = [];

export function createNamedLoopIndexesFromAccessor(
  propertyAccessor: IStatePropertyAccessor | undefined = undefined
): INamedLoopIndexes {
  const namedLoopIndexes: INamedLoopIndexes = _pool.pop() ?? new Map();
  if (typeof propertyAccessor === "undefined") return namedLoopIndexes;
  const wildcardPaths = propertyAccessor.patternInfo.wildcardPaths;
  if (wildcardPaths.length === 0 || typeof propertyAccessor.loopIndexes === "undefined") return namedLoopIndexes;
  let loopIndexes: ILoopIndexes | undefined = propertyAccessor.loopIndexes;
  for(let wi = 0; wi < wildcardPaths.length; wi++) {
    if (typeof loopIndexes === "undefined") utils.raise(`createNamedLoopIndexesFromAccessor: loopIndexes is undefined.`);
    const wildcardPath = wildcardPaths.at(- (wi + 1)) ?? utils.raise(`createNamedLoopIndexesFromAccessor: wildcardPath is undefined.`);
    namedLoopIndexes.set(wildcardPath, loopIndexes);
    loopIndexes = loopIndexes.parentLoopIndexes;
  }
  return namedLoopIndexes;
}

export function disposeNamedLoopIndexes(namedLoopIndexes: INamedLoopIndexes): void {
  namedLoopIndexes.clear();
  _pool.push(namedLoopIndexes);
}