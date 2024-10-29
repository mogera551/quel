import { IComponent } from "../component/types";
import { GetByPropInfoSymbol } from "../state/symbols";
import { IPropInfo } from "../propertyInfo/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { GetBufferSymbol } from "./symbols";

type IComponentPartial = Pick<IComponent, "parentComponent"|"updator"|"states"|"props">;

const regexp = RegExp(/^\$[0-9]+$/);

export const getterFn = (
  getLoopContext:()=>(ILoopContext | undefined),
  component:IComponentPartial,
  parentPropInfo:IPropInfo,
  thisPropIfo:IPropInfo
): any => {
  return function () {
    const loopContext = getLoopContext();
    const loopIndexes = loopContext?.serialLoopIndexes;
    if (regexp.test(parentPropInfo.name)) {
      const index = Number(parentPropInfo.name.slice(1));
      return loopIndexes?.at(index);
    }
    const buffer = component.props[GetBufferSymbol]();
    if (buffer) {
      return buffer[thisPropIfo.name];
    }
    const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
    const parentState = parentComponent.states["current"];
    const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
    const accessor = (typeof lastWildcardPath !== "undefined") ? 
      createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
    const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
    return parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
      return parentState[GetByPropInfoSymbol](parentPropInfo);
    });
  }
}
