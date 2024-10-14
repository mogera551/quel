import { setValueToChildNodes } from "../binding/setValueToChildNodes";
import { INewBindingSummary } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { createNamedLoopIndexesFromPattern } from "../loopContext/createNamedLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdator } from "./types";

export function updateChildNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary, 
  updatedStatePropertyAccesseors: IStatePropertyAccessor[]
): void {
  const parentPropertyAccessorByKey: {[key: string]: IStatePropertyAccessor} = {};
  const indexesByParentKey: {[key: string]: Set<number>} = {};
  for(const propertyAccessor of updatedStatePropertyAccesseors) {
    const patternInfo = getPatternInfo(propertyAccessor.pattern)
    const patternElements = patternInfo.patternElements;
    if (patternElements[patternElements.length - 1] !== "*") continue;

    const lastIndex = propertyAccessor.loopIndexes?.index;
    if (typeof lastIndex === "undefined") continue;

    const patternPaths = patternInfo.patternPaths;
    const parentLoopIndexes = propertyAccessor.loopIndexes?.parentLoopIndexes;
    const parentPropertyAccessor = createStatePropertyAccessor(patternPaths.at(-2) ?? "", parentLoopIndexes);
    const parentKey = parentPropertyAccessor.pattern + "\t" + (parentPropertyAccessor.loopIndexes?.toString() ?? "");

    indexesByParentKey[parentKey]?.add(lastIndex) ?? (indexesByParentKey[parentKey] = new Set([lastIndex]));
    parentPropertyAccessorByKey[parentKey] = parentPropertyAccessor;
  }

  for(const [parentKey, indexes] of Object.entries(indexesByParentKey)) {
    const parentPropertyAccessor = parentPropertyAccessorByKey[parentKey];
    newBindingSummary.gatherBindings(parentPropertyAccessor.pattern, parentPropertyAccessor.loopIndexes).forEach(binding => {
      const namedLoopIndexes = createNamedLoopIndexesFromPattern(parentPropertyAccessor.pattern, parentPropertyAccessor.loopIndexes);
      updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        setValueToChildNodes(binding, updator, binding.nodeProperty, indexes);
      });
    });
  }
}
