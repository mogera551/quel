import { IBinding, IBindingSummary, IPropertyAccess } from "../binding/types";

export function updateNodes(
  bindingSummary: IBindingSummary,
  updateStatePropertyAccessByKey: Map<string,IPropertyAccess> = new Map()
) {
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
}