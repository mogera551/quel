import { setValueToChildNodes } from "../binding/setValueToChildNodes";
import { INewBindingSummary } from "../binding/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdater } from "./types";

export function updateChildNodes(
  updater: IUpdater,
  quelBindingSummary: INewBindingSummary, 
  updatedStatePropertyAccesseors: IStatePropertyAccessor[]
): void {
  const parentPropertyAccessorByKey: {[key: string]: IStatePropertyAccessor} = {};
  const indexesByParentKey: {[key: string]: Set<number>} = {};
  for(const propertyAccessor of updatedStatePropertyAccesseors) {
    const patternElements = propertyAccessor.patternInfo.patternElements;
    if (patternElements[patternElements.length - 1] !== "*") continue;

    const lastIndex = propertyAccessor.loopIndexes?.index;
    if (typeof lastIndex === "undefined") continue;

    const patternPaths = propertyAccessor.patternInfo.patternPaths;
    const parentLoopIndexes = propertyAccessor.loopIndexes?.parentLoopIndexes;
    const parentPropertyAccessor = createStatePropertyAccessor(patternPaths.at(-2) ?? "", parentLoopIndexes);
    const parentKey = parentPropertyAccessor.key;

    indexesByParentKey[parentKey]?.add(lastIndex) ?? (indexesByParentKey[parentKey] = new Set([lastIndex]));
    parentPropertyAccessorByKey[parentKey] = parentPropertyAccessor;
  }

  for(const [parentKey, indexes] of Object.entries(indexesByParentKey)) {
    const parentPropertyAccessor = parentPropertyAccessorByKey[parentKey];
    quelBindingSummary.gatherBindings(parentPropertyAccessor).forEach(binding => {
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(parentPropertyAccessor);
      updater.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        setValueToChildNodes(binding, updater, binding.nodeProperty, indexes);
      });
    });
  }
}
