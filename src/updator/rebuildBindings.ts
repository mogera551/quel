import { IBinding, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { IUpdator } from "./types";

// ソートのための比較関数
// BindingのStateのワイルドカード数の少ないものから順に並ぶようにする
const compareExpandableBindings = (a: IBinding, b: IBinding): number => a.stateProperty.propInfo.wildcardCount - b.stateProperty.propInfo.wildcardCount;

// 
export async function rebuildBindings(
  updator: IUpdator, 
  newBindingSummary: INewBindingSummary, 
  updateStatePropertyAccessByKey: Map<string, IPropertyAccess>,
  updatedKeys: string[]
): Promise<void> {
  const propertyAccesses = Array.from(updateStatePropertyAccessByKey.values());
  for(let i = 0; i < propertyAccesses.length; i++) {
    const propertyAccess = propertyAccesses[i];
    const gatheredBindings = newBindingSummary.gatherBindings(propertyAccess.pattern, propertyAccess.indexes);
    for(let gi = 0; gi < gatheredBindings.length; gi++) {
      const binding = gatheredBindings[gi];
      if (!binding.expandable) continue;
      const compareKey = binding.stateProperty.name + ".";
      const isFullBuild = updatedKeys.some(key => key.startsWith(compareKey));
      const namedLoopIndexes = { [propertyAccess.pattern]: propertyAccess.indexes };
      updator.setFullRebuild(isFullBuild, async () => {
        await updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, async () => {
          binding.rebuild();
        });
      });
    }
  }
/*
  const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
  bindingSummary.update((bindingSummary) => {
    for(let i = 0; i < expandableBindings.length; i++) {
      const binding = expandableBindings[i];
      if (!bindingSummary.exists(binding)) continue;
      if (!updateStatePropertyAccessByKey.has(binding.stateProperty.key)) continue;
      const compareKey = binding.stateProperty.key + ".";
      const isFullBuild = updatedKeys.some(key => key.startsWith(compareKey));
      updator.setFullRebuild(isFullBuild, () => {
        binding.rebuild();
      });
    }
  });
*/
}

