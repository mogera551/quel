import { IComponent } from "../component/types";
import { getPropInfo } from "../dotNotation/getPropInfo";
import { GetByPropInfoSymbol, SetByPropInfoSymbol } from "../dotNotation/symbols";
import { IStateProxy } from "../state/types";
import { utils } from "../utils";

type IComponentPartial = Pick<IComponent,"states"|"updator">;

export class PropsProxyHandler implements ProxyHandler<IStateProxy> {

  get(target: any, prop: string, receiver: any): any {
    const component = target as IComponentPartial;
    const propInfo = getPropInfo(prop);
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
      utils.raise(`Invalid prop name: ${prop}`);
    }
    const state = component.states["current"];
    return component.updator.namedLoopIndexesStack.setNamedLoopIndexes(
      propInfo.wildcardNamedLoopIndexes,
      () => state[GetByPropInfoSymbol](propInfo)
    );
  }

  set(target: any, prop: string, value: any, receiver: any): boolean {
    const component = target as IComponentPartial;
    const propInfo = getPropInfo(prop);
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
      utils.raise(`Invalid prop name: ${prop}`);
    }
    return component.states.setWritable(() => {
      const state = component.states["current"];
      return component.updator.namedLoopIndexesStack.setNamedLoopIndexes(
        propInfo.wildcardNamedLoopIndexes,
        () => state[SetByPropInfoSymbol](propInfo, value)
      );
    })
  }

}

export function createProps(component:IComponentPartial): IStateProxy {
  return new Proxy(component, new PropsProxyHandler());
}