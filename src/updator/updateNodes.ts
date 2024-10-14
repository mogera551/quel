import { IBinding, INewBindingSummary } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { createNamedLoopIndexesFromPattern } from "../loopContext/createNamedLoopIndexes";
import { IStatePropertyAccessor } from "../state/types";
import { IUpdator } from "./types";

export async function updateNodes(
  updator: IUpdator,
  newBindingSummary: INewBindingSummary,
  updatedStatePropertyAccessors: IStatePropertyAccessor[]
) {
  const selectBindings: {binding:IBinding, propertyAccessor:IStatePropertyAccessor}[] = [];
  for(let i = 0; i < updatedStatePropertyAccessors.length; i++) {
    const propertyAccessor = updatedStatePropertyAccessors[i];
    newBindingSummary.gatherBindings(propertyAccessor.pattern, propertyAccessor.loopIndexes).forEach(async binding => {
      if (binding.expandable) return;
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push({binding, propertyAccessor});
      } else {
        const propInfo = getPatternInfo(propertyAccessor.pattern);
        const lastWildCardPath = propInfo.wildcardPaths.at(-1);
        const namedLoopIndexes = createNamedLoopIndexesFromPattern(lastWildCardPath, propertyAccessor.loopIndexes);
        updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
          binding.updateNodeForNoRecursive();
        });
      }
    });
  }
  for(let si = 0; si < selectBindings.length; si++) {
    const info = selectBindings[si];
    const propertyAccessor = info.propertyAccessor;
    const propInfo = getPatternInfo(propertyAccessor.pattern);
    const lastWildCardPath = propInfo.wildcardPaths.at(-1);
    const namedLoopIndexes = createNamedLoopIndexesFromPattern(lastWildCardPath, propertyAccessor.loopIndexes);
    updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
      info.binding.updateNodeForNoRecursive();
    });
  }
}