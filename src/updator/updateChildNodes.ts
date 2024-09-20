import { setValueToChildNodes } from "../binding/setValueToChildNodes";
import { IBindingSummary, IPropertyAccess } from "../binding/types";
import { IUpdator } from "./types";

export function updateChildNodes(
  updator: IUpdator,
  bindingSummary: IBindingSummary, 
  updatedStatePropertyAccesses: IPropertyAccess[]
): void {
  const indexesByParentKey: {[k: string]: Set<number>} = {};
  for(const propertyAccess of updatedStatePropertyAccesses) {
    const patternElements = propertyAccess.propInfo.patternElements;
    if (patternElements[patternElements.length - 1] !== "*") continue;

    const indexes = propertyAccess.indexes;
    const lastIndex = indexes?.[indexes.length - 1];
    if (typeof lastIndex === "undefined") continue;

    const patternPaths = propertyAccess.propInfo.patternPaths;
    const parentKey = patternPaths[patternPaths.length - 2] + "\t" + indexes.slice(0, -1);

    indexesByParentKey[parentKey]?.add(lastIndex) ?? (indexesByParentKey[parentKey] = new Set([lastIndex]));
  }

  for(const [parentKey, indexes] of Object.entries(indexesByParentKey)) {
    const bindings = bindingSummary.bindingsByKey.get(parentKey);
    if (typeof bindings === "undefined") continue;
    for(const binding of bindings) {
      setValueToChildNodes(binding, updator, binding.nodeProperty, indexes);
    }
  }
}
