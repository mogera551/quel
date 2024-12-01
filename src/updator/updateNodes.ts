import { IBinding, INewBindingSummary } from "../binding/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdator } from "./types";

export function updateNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary,
  updatedStatePropertyAccessors: IStatePropertyAccessor[]
) {
  const selectBindings: {binding:IBinding, propertyAccessor:IStatePropertyAccessor}[] = [];
  // select要素以外を更新
  for(let i = 0; i < updatedStatePropertyAccessors.length; i++) {
    const propertyAccessor = updatedStatePropertyAccessors[i];
    const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
    const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
    newBindingSummary.gatherBindings(propertyAccessor).forEach(async binding => {
      if (binding.expandable) return;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, propertyAccessor});
      } else {
        const namedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardPropertyAccessor);
        updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
          binding.updateNodeForNoRecursive();
        });
      }
    });
  }
  // select要素を更新
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccessor = info.propertyAccessor;
    const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
    const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
    const namedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardPropertyAccessor);
    updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
      info.binding.updateNodeForNoRecursive();
    });
  }
}