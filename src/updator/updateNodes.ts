import { IBinding, IBindingSummary, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { Indexes } from "../dotNotation/types";
import { IUpdator } from "./types";

export async function updateNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary,
  updateStatePropertyAccessByKey: Map<string,IPropertyAccess> = new Map()
) {
  const propertyAccesses = Array.from(updateStatePropertyAccessByKey.values());
  const selectBindings: {binding:IBinding, propertyAccess:IPropertyAccess}[] = [];
  for(let i = 0; i < propertyAccesses.length; i++) {
    const propertyAccess = propertyAccesses[i];
    newBindingSummary.gatherBindings(propertyAccess.pattern, propertyAccess.indexes).forEach(async binding => {
      if (binding.expandable) return;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, propertyAccess});
      } else {
        if (propertyAccess.indexes.length > 0) {
          const namedLoopIndexes = { [propertyAccess.pattern]: propertyAccess.indexes };
          await updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, async () => {
            binding.updateNodeForNoRecursive();
          });
        } else {
          await updator.namedLoopIndexesStack.setNamedLoopIndexes({}, async () => {
            binding.updateNodeForNoRecursive();
          });
        }

      }
    });
  }
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccess = info.propertyAccess;
    if (propertyAccess.indexes.length > 0) {
      const namedLoopIndexes = { [propertyAccess.pattern]: propertyAccess.indexes };
      await updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, async () => {
        info.binding.updateNodeForNoRecursive();
      });
    } else {
      await updator.namedLoopIndexesStack.setNamedLoopIndexes({}, async () => {
        info.binding.updateNodeForNoRecursive();
      });
    }
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