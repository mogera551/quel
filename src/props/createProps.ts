import { IComponent } from "../component/types";
import { getPropInfo } from "../propertyInfo/getPropInfo";
import { GetBaseStateSymbol, GetByPropInfoSymbol, SetByPropInfoSymbol } from "../state/symbols";
import { IPropInfo } from "../propertyInfo/types";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { ILoopContext } from "../loopContext/types";
import { createStatePropertyAccessor } from "../state/createStatePropertyAccessor";
import { utils } from "../utils";
import { createPropsBindingInfo } from "./createPropsBindingInfo";
import { getterFn } from "./getterFn";
import { setterFn } from "./setterFn";
import { BindPropertySymbol, CheckDuplicateSymbol, ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { IPropBuffer, IProps, IPropsBindingInfo } from "./types";

type IComponentPartialForProps = Pick<IComponent,"quelParentComponent"|"quelState"|"quelUpdater"|"quelProps">;


class PropsProxyHandler implements ProxyHandler<IProps> {
  propsBindingInfos: IPropsBindingInfo[] = [];
  propsBindingInfoKeys: Set<string> = new Set();
  parentProps: Set<string> = new Set();
  thisProps: Set<string> = new Set();
  loopContextByParentProp: Map<string, ()=>(ILoopContext | undefined)> = new Map();

  #component: IComponentPartialForProps;
  #propBuffer: IPropBuffer | undefined;
  get propBuffer() {
    return this.#propBuffer;
  }

  constructor(component:IComponentPartialForProps) {
    this.#component = component;
  }

  bindProperty(
    getLoopContext:()=>(ILoopContext | undefined), 
    parentProp: string, 
    thisProp: string
  ): void {
    const component = this.#component;
    const bindingInfo = createPropsBindingInfo(parentProp, thisProp);
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
    if (this.propsBindingInfoKeys.has(bindingInfo.key)) {
      utils.raise(`Duplicate binding property: ${parentProp}:${thisProp}`);
    }
    const parentPropInfo = getPropInfo(parentProp);
    this.propsBindingInfos.push(bindingInfo);
    this.propsBindingInfoKeys.add(bindingInfo.key);
    this.parentProps.add(parentProp);
    this.thisProps.add(thisProp);
    this.loopContextByParentProp.set(parentProp, getLoopContext);

    const state = component.quelState[GetBaseStateSymbol]();
    const attributes = {
      enumerable: true,
      configurable: true,
      get: getterFn(getLoopContext, component, parentPropInfo, propInfo),
      set: setterFn(getLoopContext, component, parentPropInfo, propInfo)
    }
    Object.defineProperty(state, thisProp, attributes)
  }

  setBuffer(buffer: IPropBuffer): void {
    this.#propBuffer = buffer;
  }

  getBuffer(): IPropBuffer | undefined {
    return this.#propBuffer;
  }

  clearBuffer(): void {
    this.#propBuffer = undefined;
  }

  /**
   * バインドプロパティからバッファを作成します
   * asyncShowPopover, async
   * @returns {IPropBuffer} バッファ
   */
  createBuffer(): IPropBuffer {
    const component = this.#component;
    if (this.parentProps.size === 0) utils.raise("No binding properties to buffer");
    const propsBuffer: {[key:string]: any} = {};
    const quelParentComponent = component.quelParentComponent ?? utils.raise("quelParentComponent is undefined");
    const parentState = quelParentComponent.quelState;
    for(const bindingInfo of this.propsBindingInfos) {
      const { parentProp, thisProp } = bindingInfo;
      const getLoopContext = this.loopContextByParentProp.get(parentProp);
      const loopContext = getLoopContext?.();
      const loopIndexes = loopContext?.serialLoopIndexes;
      const parentPropInfo = getPropInfo(parentProp);
      const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
      const accessor = (typeof lastWildcardPath !== "undefined") ? 
        createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
      const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
      const parentValue = quelParentComponent.quelUpdater.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
        return parentState[GetByPropInfoSymbol](parentPropInfo);
      });
      propsBuffer[thisProp] = parentValue;
    }
    return propsBuffer;
  }

  flushBuffer(): void {
    const component = this.#component;
    if (this.#propBuffer === undefined) return;
    const parentComponent = component.quelParentComponent ?? utils.raise("quelParentComponent is undefined");
    for(const bindingInfo of this.propsBindingInfos) {
      const { parentProp, thisProp } = bindingInfo;
      const getLoopContext = this.loopContextByParentProp.get(parentProp);
      const loopContext = getLoopContext?.();
      const parentPropInfo = getPropInfo(parentProp);
      const value = this.#propBuffer[thisProp];

      // プロセスキューに積む
      const writeProperty = (component: IComponentPartialForProps, propInfo: IPropInfo, value: any) => {
        const state = component.quelState;
        return state[SetByPropInfoSymbol](propInfo, value);
      };
      parentComponent.quelUpdater?.addProcess(writeProperty, undefined, [ parentComponent, parentPropInfo, value ], loopContext);
    }
  }

  get(target: any, prop: PropertyKey, receiver: any): any {
    if (prop === BindPropertySymbol) {
      return (parentProp: string, thisProp: string, getLoopContext:()=>(ILoopContext | undefined)): void => 
        this.bindProperty(getLoopContext, parentProp, thisProp);
    } else if (prop === SetBufferSymbol) {
      return (buffer: IPropBuffer): void => this.setBuffer(buffer);
    } else if (prop === GetBufferSymbol) {
      return (): IPropBuffer | undefined => this.getBuffer();
    } else if (prop === ClearBufferSymbol) {
      return (): void => this.clearBuffer();
    } else if (prop === CreateBufferSymbol) {
      return (): IPropBuffer => this.createBuffer();
    } else if (prop === FlushBufferSymbol) {
      return (): void => this.flushBuffer();
    } else if (prop === CheckDuplicateSymbol) {
      return (parentProp: string, thisProp: string): boolean => {
        const bindingInfo = createPropsBindingInfo(parentProp, thisProp);
        return this.propsBindingInfoKeys.has(bindingInfo.key);
      }
    }
    if (typeof prop === "symbol" || typeof prop === "number") {
      return Reflect.get(target, prop, receiver);
    }
    const propInfo = getPropInfo(prop);
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
      utils.raise(`Invalid prop name: ${prop}`);
    }
    const component = this.#component;
    const state = component.quelState;
    return component.quelUpdater.namedLoopIndexesStack.setNamedLoopIndexes(
      propInfo.wildcardNamedLoopIndexes,
      () => state[GetByPropInfoSymbol](propInfo)
    );
  }

  set(target: any, prop: PropertyKey, value: any, receiver: any): boolean {
    if (typeof prop === "symbol" || typeof prop === "number") {
      return Reflect.set(target, prop, value, receiver);
    }
    const propInfo = getPropInfo(prop);
    if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
      utils.raise(`Invalid prop name: ${prop}`);
    }
    // プロセスキューに積む
    const component = this.#component;
    const writeProperty = (component: IComponentPartialForProps, propInfo: IPropInfo, value: any) => {
      const state = component.quelState;
      return component.quelUpdater.namedLoopIndexesStack.setNamedLoopIndexes(
        propInfo.wildcardNamedLoopIndexes,
        () => state[SetByPropInfoSymbol](propInfo, value)
      );
    };
    component.quelUpdater?.addProcess(writeProperty, undefined, [ component, propInfo, value ], undefined);
    return true;
  }

  ownKeys(target: any):string[] {
    return Array.from(this.thisProps);
  }

  getOwnPropertyDescriptor(target: any, prop: string):PropertyDescriptor { // プロパティ毎に呼ばれます
    if (!this.thisProps.has(prop)) return {
      enumerable: false,
      configurable: true
    };
    return {
      enumerable: true,
      configurable: true
      /* ...other flags, probable "value:..."" */
    };
  }

}

export function createProps(component:IComponentPartialForProps): IProps {
  return new Proxy({}, new PropsProxyHandler(component));
}