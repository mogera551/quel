import { IComponent } from "../component/types";
import { SetByPropInfoSymbol } from "../state/symbols";
import { IPropInfo } from "../propertyInfo/types";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { GetBufferSymbol } from "./symbols";

type IComponentPartial = Pick<IComponent, "parentComponent"|"updator"|"state"|"props">;

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
    const buffer = component.props[GetBufferSymbol]();
    if (buffer) {
      return buffer[thisPropIfo.name] = value;
    }
    // プロセスキューに積む
    const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
    const loopContext = getLoopContext();
    const writeProperty = (component: IComponentPartial, propInfo: IPropInfo, value: any) => {
      const state = component.state;
      return state[SetByPropInfoSymbol](propInfo, value);
    };
    parentComponent.updator?.addProcess(writeProperty, undefined, [ parentComponent, parentPropInfo, value ], loopContext);
    return true;
  }
}
