import { IComponent } from "../component/types";
import { SetByPropInfoSymbol } from "../dotNotation/symbols";
import { IPropInfo } from "../dotNotation/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { GetBufferSymbol } from "./symbols";

type IComponentPartial = Pick<IComponent, "parentComponent"|"updator"|"states"|"props">;

const regexp = RegExp(/^\$[0-9]+$/);

export const setterFn = (
  loopContext:ILoopContext | undefined,
  component:IComponentPartial, 
  parentPropInfo:IPropInfo,
  thisPropIfo:IPropInfo
): any => {
  return function (value: any): boolean {
    if (regexp.test(parentPropInfo.name)) {
      utils.raise("Cannot set value to loop index");
    }
    const buffer = component.props[GetBufferSymbol]();
    if (buffer) {
      return buffer[thisPropIfo.name] = value;
    }
    // ToDo: プロセスキューに積むかどうか検討する
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
