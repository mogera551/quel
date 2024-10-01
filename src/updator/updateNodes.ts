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
        await updator.setLoopIndexes(propertyAccess.pattern, propertyAccess.indexes, async () => {
          binding.updateNodeForNoRecursive(propertyAccess.indexes);
        });

      }
    });
  }
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccess = info.propertyAccess;
    await updator.setLoopIndexes(propertyAccess.pattern, propertyAccess.indexes, async () => {
      info.binding.updateNodeForNoRecursive(propertyAccess.indexes);
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