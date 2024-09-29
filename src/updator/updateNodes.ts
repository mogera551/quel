import { IBinding, IBindingSummary, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { Indexes } from "../dotNotation/types";

export function updateNodes(
  newBindingSummary: INewBindingSummary,
  updateStatePropertyAccessByKey: Map<string,IPropertyAccess> = new Map()
) {
  const propertyAccesses = Array.from(updateStatePropertyAccessByKey.values());
  const selectBindings: {binding:IBinding, indexes:number[]}[] = [];
  for(let i = 0; i < propertyAccesses.length; i++) {
    newBindingSummary.gatherBindings(propertyAccesses[i].pattern, propertyAccesses[i].indexes).forEach(binding => {
      if (binding.expandable) return;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, indexes:propertyAccesses[i].indexes});
      } else {
        binding.updateNodeForNoRecursive(propertyAccesses[i].indexes);
      }
    });
  }
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    info.binding.updateNodeForNoRecursive(info.indexes);
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