import { IBinding, INewBindingSummary } from "../binding/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdater } from "./types";

export function updateNodes(
  updater: IUpdater,
  quelBindingSummary: INewBindingSummary,
  updatedStatePropertyAccessors: IStatePropertyAccessor[]
) {
  const selectBindings: {binding:IBinding, propertyAccessor:IStatePropertyAccessor}[] = [];
  const updateNode = (binding:IBinding, wildcardPropertyAccessor:IStatePropertyAccessor) => {
    const loopContext = binding.parentContentBindings.loopContext;
    if (typeof loopContext === "undefined") {
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardPropertyAccessor);
      updater.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        binding.updateNodeForNoRecursive();
      });
    } else {
      updater.loopContextStack.setLoopContext(updater.namedLoopIndexesStack, loopContext, async () => {
        binding.updateNodeForNoRecursive();
      });
    }
  }
  // select要素以外を更新
  for(let i = 0; i < updatedStatePropertyAccessors.length; i++) {
    const propertyAccessor = updatedStatePropertyAccessors[i];
    const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
    const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
    for(const binding of quelBindingSummary.gatherBindings(propertyAccessor)) {
      if (binding.expandable) continue;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, propertyAccessor});
      } else {
        updateNode(binding, wildcardPropertyAccessor);
      }
    }
  }
  // select要素を更新
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccessor = info.propertyAccessor;
    const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
    const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
    updateNode(info.binding, wildcardPropertyAccessor);
  }
}