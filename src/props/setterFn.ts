import { IComponent } from "../component/types";
import { SetByPropInfoSymbol } from "../dotNotation/symbols";
import { IPropInfo } from "../dotNotation/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";

type IComponentPartial = Pick<IComponent, "parentComponent"|"updator"|"states">;

export const setterFn = (
  loopContext:ILoopContext | undefined,
  component:IComponentPartial, 
  parentPropInfo:IPropInfo
): any => {
  return function (value: any): boolean {
    const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
    const loopIndexes = loopContext?.serialLoopIndexes;
    const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1);
    const accessor = (typeof lastWildcardPath !== "undefined") ? 
      createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
    const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
    return parentComponent.states.setWritable(() => {
      const parentState = parentComponent.states["current"];
      return parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        return parentState[SetByPropInfoSymbol](parentPropInfo, value);
      });
    });
  }
}
