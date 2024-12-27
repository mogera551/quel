import { IComponent } from "../component/types";
import { SetByPropInfoSymbol } from "../state/symbols";
import { IPropInfo } from "../propertyInfo/types";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { GetBufferSymbol } from "./symbols";

type IComponentPartial = Pick<IComponent, "quelParentComponent"|"quelUpdator"|"quelState"|"quelProps">;

const regexp = RegExp(/^\$[0-9]+$/);

export const setterFn = (
  getLoopContext:()=>(ILoopContext | undefined),
  component:IComponentPartial, 
  parentPropInfo:IPropInfo,
  thisPropIfo:IPropInfo
): any => {
  return function (value: any): boolean {
    if (regexp.test(parentPropInfo.name)) {
      utils.raise("Cannot set value to loop index");
    }
    const buffer = component.quelProps[GetBufferSymbol]();
    if (buffer) {
      return buffer[thisPropIfo.name] = value;
    }
    // プロセスキューに積む
    const quelParentComponent = component.quelParentComponent ?? utils.raise("quelParentComponent is undefined");
    const loopContext = getLoopContext();
    const writeProperty = (component: IComponentPartial, propInfo: IPropInfo, value: any) => {
      const state = component.quelState;
      return state[SetByPropInfoSymbol](propInfo, value);
    };
    quelParentComponent.quelUpdator?.addProcess(writeProperty, undefined, [ quelParentComponent, parentPropInfo, value ], loopContext);
    return true;
  }
}
