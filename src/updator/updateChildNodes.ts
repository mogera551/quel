import { createPropertyAccess } from "../binding/createPropertyAccess";
import { setValueToChildNodes } from "../binding/setValueToChildNodes";
import { INewBindingSummary, IPropertyAccess } from "../binding/types";
import { createNamedLoopIndexesFromPattern } from "../loopContext/createNamedLoopIndexes";
import { IUpdator } from "./types";

export function updateChildNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary, 
  updatedStatePropertyAccesses: IPropertyAccess[]
): void {
  const parentPropertyAccessByKey: {[key: string]: IPropertyAccess} = {};
  const indexesByParentKey: {[key: string]: Set<number>} = {};
  for(const propertyAccess of updatedStatePropertyAccesses) {
    const patternElements = propertyAccess.propInfo.patternElements;
    if (patternElements[patternElements.length - 1] !== "*") continue;

    const indexes = propertyAccess.indexes;
    const lastIndex = indexes?.[indexes.length - 1];
    if (typeof lastIndex === "undefined") continue;

    const patternPaths = propertyAccess.propInfo.patternPaths;
    const parentPropertyAccess = createPropertyAccess(patternPaths[patternPaths.length - 2], indexes.slice(0, -1));
    const parentKey = parentPropertyAccess.key;

    indexesByParentKey[parentKey]?.add(lastIndex) ?? (indexesByParentKey[parentKey] = new Set([lastIndex]));
    parentPropertyAccessByKey[parentKey] = parentPropertyAccess;
  }

  for(const [parentKey, indexes] of Object.entries(indexesByParentKey)) {
    const parentPropertyAccess = parentPropertyAccessByKey[parentKey];
    newBindingSummary.gatherBindings(parentPropertyAccess.pattern, parentPropertyAccess.indexes).forEach(binding => {
      const namedLoopIndexes = createNamedLoopIndexesFromPattern(parentPropertyAccess.pattern, parentPropertyAccess.indexes);
      updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        setValueToChildNodes(binding, updator, binding.nodeProperty, indexes);
      });
    });
  }
}
