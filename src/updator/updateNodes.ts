import { IBinding, IBindingSummary, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { Indexes } from "../dotNotation/types";
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
/*  
  const allBindingsForUpdate: IBinding[] = [];
  for(let key of updateStatePropertyAccessByKey.keys()) {
    const bindings = bindingSummary.bindingsByKey.get(key);
    if (typeof bindings === "undefined") continue;
    allBindingsForUpdate.push.apply(allBindingsForUpdate, bindings);
  }
  const uniqueAllBindingsForUpdate = Array.from(new Set(allBindingsForUpdate));
  const selectBindings = [];
  for(let ui = 0; ui < uniqueAllBindingsForUpdate.length; ui++) {
    const binding = uniqueAllBindingsForUpdate[ui];
    if (binding.nodeProperty.isSelectValue) {
      selectBindings.push(binding);
    } else {
      binding.updateNodeForNoRecursive();
    }
  }
  for(let si = 0; si < selectBindings.length; si++) {
    selectBindings[si].updateNodeForNoRecursive();
  }
*/
}