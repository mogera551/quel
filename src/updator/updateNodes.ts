import { IBinding, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { createNamedLoopIndexesFromPattern } from "../loopContext/createNamedLoopIndexes";
import { IUpdator } from "./types";

export async function updateNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary,
  updatedStatePropertyAccesses: IPropertyAccess[]
) {
  const selectBindings: {binding:IBinding, propertyAccess:IPropertyAccess}[] = [];
  for(let i = 0; i < updatedStatePropertyAccesses.length; i++) {
    const propertyAccess = updatedStatePropertyAccesses[i];
    newBindingSummary.gatherBindings(propertyAccess.pattern, propertyAccess.indexes).forEach(async binding => {
      if (binding.expandable) return;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, propertyAccess});
      } else {
        const lastWildCardPath = propertyAccess.propInfo.wildcardPaths[propertyAccess.propInfo.wildcardPaths.length - 1];
        const namedLoopIndexes = createNamedLoopIndexesFromPattern(lastWildCardPath, propertyAccess.indexes);
        updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
          binding.updateNodeForNoRecursive();
        });
      }
    });
  }
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccess = info.propertyAccess;
    const lastWildCardPath = propertyAccess.propInfo.wildcardPaths[propertyAccess.propInfo.wildcardPaths.length - 1];
    const namedLoopIndexes = createNamedLoopIndexesFromPattern(lastWildCardPath, propertyAccess.indexes);
    updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
      info.binding.updateNodeForNoRecursive();
    });
  }
}