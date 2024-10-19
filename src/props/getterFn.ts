import { IComponent } from "../component/types";
import { GetByPropInfoSymbol } from "../dotNotation/symbols";
import { IPropInfo } from "../dotNotation/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";

type IComponentPartial = Pick<IComponent, "updator"|"states">;

export const getterFn = (
  loopContext:ILoopContext | undefined,
  parentComponent:IComponentPartial,
  parentPropInfo:IPropInfo
): any => {
  return function () {
    const parentState = parentComponent.states["current"];
    const loopIndexes = loopContext?.serialLoopIndexes;
    const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
    const accessor = (typeof lastWildcardPath !== "undefined") ? 
      createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
    const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
    return parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
      return parentState[GetByPropInfoSymbol](parentPropInfo);
    });
  }
}
