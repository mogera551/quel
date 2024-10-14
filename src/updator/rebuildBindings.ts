import { IBinding, INewBindingSummary } from "../binding/types";
import { createNamedLoopIndexesFromPattern } from "../loopContext/createNamedLoopIndexes";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdator } from "./types";

// ソートのための比較関数
// BindingのStateのワイルドカード数の少ないものから順に並ぶようにする
const compareExpandableBindings = (a: IBinding, b: IBinding): number => a.stateProperty.propInfo.wildcardCount - b.stateProperty.propInfo.wildcardCount;

// 
export async function rebuildBindings(
  updator: IUpdator, 
  newBindingSummary: INewBindingSummary, 
  updatedStatePropertyAccessors: IStatePropertyAccessor[],
  updatedKeys: string[]
): Promise<void> {
  for(let i = 0; i < updatedStatePropertyAccessors.length; i++) {
    const propertyAccessor = updatedStatePropertyAccessors[i];
    const gatheredBindings = newBindingSummary.gatherBindings(propertyAccessor);
    for(let gi = 0; gi < gatheredBindings.length; gi++) {
      const binding = gatheredBindings[gi];
      if (!binding.expandable) continue;
      const compareKey = binding.stateProperty.name + ".";
      const isFullBuild = updatedKeys.some(key => key.startsWith(compareKey));
      const namedLoopIndexes = createNamedLoopIndexesFromPattern(propertyAccessor);
      updator.setFullRebuild(isFullBuild, () => {
        updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
          binding.rebuild();
        });
      });
    }
  }
}

