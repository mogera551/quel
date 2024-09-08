import { IBinding, IBindingSummary, IPropertyAccess } from "../binding/types";
import { IUpdator } from "./types";

// ソートのための比較関数
// BindingのStateのワイルドカード数の少ないものから順に並ぶようにする
const compareExpandableBindings = (a: IBinding, b: IBinding): number => a.stateProperty.propInfo.wildcardCount - b.stateProperty.propInfo.wildcardCount;

// 
export function rebuildBindings(
  updator: IUpdator, 
  bindingSummary: IBindingSummary, 
  updateStatePropertyAccessByKey: {
    [k: string]: IPropertyAccess;
  }
): IBinding[]
 {
  const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
  bindingSummary.update((bindingSummary) => {
    for(let i = 0; i < expandableBindings.length; i++) {
      const binding = expandableBindings[i];
      if (!bindingSummary.exists(binding)) continue;
      if (typeof updateStatePropertyAccessByKey[binding.stateProperty.key] === "undefined") continue;
      binding.rebuild();
    }
  });
  return updator.retrieveAllBindingsForUpdate();

}

