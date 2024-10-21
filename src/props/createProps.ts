import { IComponent } from "../component/types";
import { getPropInfo } from "../dotNotation/getPropInfo";
import { GetByPropInfoSymbol, SetByPropInfoSymbol } from "../dotNotation/symbols";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { getterFn } from "./getterFn";
import { setterFn } from "./setterFn";
import { BindPropertySymbol, ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { IPropBuffer, IProps } from "./types";

type IComponentPartialForProps = Pick<IComponent,"parentComponent"|"states"|"updator"|"props">;

class PropsProxyHandler implements ProxyHandler<IProps> {
  parentPropToThisProp: Map<string, string> = new Map();
  parentProps: Set<string> = new Set();
  thisProps: Set<string> = new Set();
  loopContextByParentProp: Map<string, ILoopContext | undefined> = new Map();

  #propBuffer: IPropBuffer | undefined;
  get propBuffer() {
    return this.#propBuffer;
  }

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
    this.loopContextByParentProp.set(parentProp, loopContext);

    const state = component.states["base"];
    const attributes = {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
      get: getterFn(loopContext, component, parentPropInfo, propInfo),
      set: setterFn(loopContext, component, parentPropInfo, propInfo)
    }
    Object.defineProperty(state, thisProp, attributes)
  }

  setBuffer(buffer: IPropBuffer): void {
    if (this.parentProps.size > 0) utils.raise("Binding properties already set");
    this.#propBuffer = buffer;
  }

  getBuffer(): IPropBuffer | undefined {
    return this.#propBuffer;
  }

  clearBuffer(): void {
    this.#propBuffer = undefined;
  }

  createBuffer(component: IComponentPartialForProps): IPropBuffer {
    if (this.parentProps.size === 0) utils.raise("No binding properties to buffer");
    this.#propBuffer = {};
    const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
    const parentState = parentComponent.states["current"];
    for(const [parentProp, thisProp] of this.parentPropToThisProp) {
      const loopContext = this.loopContextByParentProp.get(parentProp);
      const loopIndexes = loopContext?.serialLoopIndexes;
      const parentPropInfo = getPropInfo(parentProp);
      const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
      const accessor = (typeof lastWildcardPath !== "undefined") ? 
        createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      const parentValue = parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        return parentState[GetByPropInfoSymbol](parentPropInfo);
      });
      this.#propBuffer[thisProp] = parentValue;
    }
    return this.#propBuffer;
  }

  flushBuffer(component: IComponentPartialForProps): void {
    if (this.#propBuffer === undefined) return;
    // ToDo: プロセスキューに積むかどうか検討する
    const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
    for(const [parentProp, thisProp] of this.parentPropToThisProp) {
      const loopContext = this.loopContextByParentProp.get(parentProp);
      const loopIndexes = loopContext?.serialLoopIndexes;
      const parentPropInfo = getPropInfo(parentProp);
      const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
      const accessor = (typeof lastWildcardPath !== "undefined") ? 
        createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      const value = this.#propBuffer[thisProp];
      parentComponent.states.setWritable(() => {
        const parentState = parentComponent.states["current"];
        return parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
          return parentState[SetByPropInfoSymbol](parentPropInfo, value);
        });
      });
    }
  }

  get(target: any, prop: PropertyKey, receiver: any): any {
    const component = target as IComponentPartialForProps;
    if (prop === BindPropertySymbol) {
      return (parentProp: string, thisProp: string, loopContext:ILoopContext | undefined): void => 
        this.bindProperty(loopContext, component, parentProp, thisProp);
    } else if (prop === SetBufferSymbol) {
      return (buffer: IPropBuffer): void => this.setBuffer(buffer);
    } else if (prop === GetBufferSymbol) {
      return (): IPropBuffer | undefined => this.getBuffer();
    } else if (prop === ClearBufferSymbol) {
      return (): void => this.clearBuffer();
    } else if (prop === CreateBufferSymbol) {
      return (): IPropBuffer => this.createBuffer(component);
    } else if (prop === FlushBufferSymbol) {
      return (): void => this.flushBuffer(component);
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
    // ToDo: プロセスキューに積むかどうか検討する
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