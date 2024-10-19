import { IComponent } from "../component/types";
import { getPropInfo } from "../dotNotation/getPropInfo";
import { GetByPropInfoSymbol, SetByPropInfoSymbol } from "../dotNotation/symbols";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { getterFn } from "./getterFn";
import { setterFn } from "./setterFn";
import { BindPropertySymbol, ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { IPropBuffer, IProps } from "./types";

type IComponentPartialForProps = Pick<IComponent,"parentComponent"|"states"|"updator">;

class PropsProxyHandler implements ProxyHandler<IProps> {
  parentPropToThisProp: Map<string, string> = new Map();
  parentProps: Set<string> = new Set();
  thisProps: Set<string> = new Set();

  bindProperty(
    loopContext:ILoopContext | undefined, 
    component:IComponentPartialForProps, 
    parentProp: string, 
    thisProp: string
  ): void {
    if (this.parentProps.has(parentProp)) {
      utils.raise(`Duplicate binding property: ${parentProp}`);
    }
    if (this.thisProps.has(thisProp)) {
      utils.raise(`Duplicate binding property: ${thisProp}`);
    }
    const propInfo = getPropInfo(thisProp);
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
      utils.raise(`Invalid prop name: ${thisProp}`);
    }
    const parentPropInfo = getPropInfo(parentProp);
    this.parentPropToThisProp.set(parentProp, thisProp);
    this.parentProps.add(parentProp);
    this.thisProps.add(thisProp);

    const state = component.states["base"];
    const attributes = {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
      get: getterFn(loopContext, component, parentPropInfo),
      set: setterFn(loopContext, component, parentPropInfo)
    }
    Object.defineProperty(state, thisProp, attributes)
  }

  setBuffer(buffer: IPropBuffer): void {
  }
  getBuffer(): IPropBuffer {
    return {};
  }
  clearBuffer(): void {
  }
  createBuffer(): IPropBuffer {
    return {};
  }
  flushBuffer(): void {
  }

  get(target: any, prop: PropertyKey, receiver: any): any {
    const component = target as IComponentPartialForProps;
    if (prop === BindPropertySymbol) {
      return (parentProp: string, thisProp: string, loopContext:ILoopContext | undefined): void => 
        this.bindProperty(loopContext, component, parentProp, thisProp);
    } else if (prop === SetBufferSymbol) {
      return (buffer: IPropBuffer): void => this.setBuffer(buffer);
    } else if (prop === GetBufferSymbol) {
      return (): IPropBuffer => this.getBuffer();
    } else if (prop === ClearBufferSymbol) {
      return (): void => this.clearBuffer();
    } else if (prop === CreateBufferSymbol) {
      return (): IPropBuffer => this.createBuffer();
    } else if (prop === FlushBufferSymbol) {
      return (): void => this.flushBuffer();
    }
    if (typeof prop === "symbol" || typeof prop === "number") {
      return Reflect.get(target, prop, receiver);;
    }
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

  set(target: any, prop: PropertyKey, value: any, receiver: any): boolean {
    if (typeof prop === "symbol" || typeof prop === "number") {
      return Reflect.set(target, prop, value, receiver);
    }
    const component = target as IComponentPartialForProps;
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

export function createProps(component:IComponentPartialForProps): IProps {
  return new Proxy(component, new PropsProxyHandler());
}