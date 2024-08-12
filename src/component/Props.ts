import { utils } from "../utils.js";
import { IComponent, IProps } from "../@types/component";
import { IBindingPropertyAccess } from "../@types/binding";
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import { CreateBufferApiSymbol, FlushBufferApiSymbol, NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { BindPropertySymbol, ClearBufferSymbol, ClearSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "../@symbols/component.js";
import { RE_CONTEXT_INDEX } from "../dot-notation/Const";
import { getPatternNameInfo } from "../dot-notation/PatternName.js";

const getPopoverContextIndexes = (component:IComponent):number[]|undefined => {
  const id = component.id;
  return component.parentComponent?.popoverContextIndexesById?.get(id);
}

const contextLoopIndexes = (handler:Handler, props:IBindingPropertyAccess):number[] => {
  let indexes;
  const propName = getPatternNameInfo(props.name);
  if (propName.level > 0 && props.indexes.length === 0 && handler.component.hasAttribute("popover")) {
    indexes = getPopoverContextIndexes(handler.component)?.slice(0 , propName.level);
  }
  return indexes ?? props.indexes;
}

class Handler implements ProxyHandler<IProps> {

  constructor(component:IComponent) {
    this.#component = component;
  }

  #component:IComponent;
  get component():IComponent {
    return this.#component;
  }

  #buffer?:{[key:string]:any};
  get buffer() {
    return this.#buffer;
  }

  #binds:{prop:string, propAccess:IBindingPropertyAccess}[] = [];
  get binds():{prop:string, propAccess:IBindingPropertyAccess}[] {
    return this.#binds;
  }

  #saveBindProperties:{[key:string]:any} = {};

  /**
   * bind parent component's property
   * @param {string} prop 
   * @param {{name:string,indexes:number[]}|undefined} propAccess 
   */
  #bindProperty(prop:string, propAccess?:IBindingPropertyAccess) {
    const getFunc = (handler:Handler, name:string, props?:IBindingPropertyAccess) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else {
        if (typeof props === "undefined") utils.raise(`PropertyAccess is required`);
        const match = RE_CONTEXT_INDEX.exec(props.name);
        if (match) {
          const loopIndex = Number(match[1]) - 1;
          let indexes = props.loopContext.indexes;
          if (indexes.length === 0 && handler.component.hasAttribute("popover")) {
            indexes = getPopoverContextIndexes(handler.component) ?? [];
          }
          return indexes[loopIndex];
        } else {
          const loopIndexes = contextLoopIndexes(handler, props);
          return handler.component.parentComponent.readonlyState[GetDirectSymbol](props.name, loopIndexes);
        }
      }
    };
    /**
     * return parent component's property setter function
     */
    const setFunc = (handler:Handler, name:string, props?:IBindingPropertyAccess) => function (value:any) {
      if (typeof handler.buffer !== "undefined") {
        handler.buffer[name] = value;
      } else {
        if (typeof props === "undefined") utils.raise(`PropertyAccess is required`);
        const loopIndexes = contextLoopIndexes(handler, props);
        handler.component.parentComponent.writableState[SetDirectSymbol](props.name, loopIndexes, value);
      }
      return true;
    };
    // save
    this.#saveBindProperties[prop] = Object.getOwnPropertyDescriptor(this.#component.baseState, prop) ?? {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    };

    // define component's property
    Object.defineProperty(this.#component.baseState, prop, {
      get: getFunc(this, prop, propAccess),
      set: setFunc(this, prop, propAccess),
      configurable: true,
      enumerable: true,
    });
    if (typeof propAccess !== "undefined") {
      this.#binds.push({ prop, propAccess });
    }

  }

  #setBuffer(buffer:{[key:string]:any}) {
    this.#buffer = buffer;
    for(const key in buffer) {
      this.#bindProperty(key);
      this.#component.currentState[NotifyForDependentPropsApiSymbol](key, []);
    }
  }

  #getBuffer():{[key:string]:any}|undefined {
    return this.#buffer;
  }

  #clearBuffer():void {
    this.#buffer = undefined;
  }

  #createBuffer():{[key:string]:any} {
    let buffer:{[key:string]:any}|undefined;
    buffer = this.#component.parentComponent.readonlyState[CreateBufferApiSymbol](this.#component);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      const loopIndexes = contextLoopIndexes(this, propAccess);
      buffer[prop] = this.#component.parentComponent.readonlyState[GetDirectSymbol](propAccess.name, loopIndexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const buffer = this.#buffer;
      const result = this.#component.parentComponent.writableState[FlushBufferApiSymbol](buffer, this.#component);
      if (result !== true) {
        this.#binds.forEach(({ prop, propAccess }) => {
          const loopIndexes = contextLoopIndexes(this, propAccess);
          this.#component.parentComponent.writableState[SetDirectSymbol](propAccess.name, loopIndexes, buffer[prop]);     
        });
      }
    }
  }

  #clear() {
    this.#buffer = undefined;
    this.#binds = [];
    for(const [key, desc] of Object.entries(this.#saveBindProperties)) {
      Object.defineProperty(this.#component.baseState, key, desc);
    }
    this.#saveBindProperties = {};
  }
  /**
   * Proxy.get
   */
  get(target:any, prop:PropertyKey, receiver:IProps):any {
    if (prop === BindPropertySymbol) {
      return (prop:string, propAccess:IBindingPropertyAccess) => this.#bindProperty(prop, propAccess);
    } else if (prop === SetBufferSymbol) {
      return (buffer:{[key:string]:any}) => this.#setBuffer(buffer);
    } else if (prop === GetBufferSymbol) {
      return ():{[key:string]:any}|undefined => this.#getBuffer();
    } else if (prop === ClearBufferSymbol) {
      return () => this.#clearBuffer();
    } else if (prop === CreateBufferSymbol) {
      return ():{[key:string]:any} => this.#createBuffer();
    } else if (prop === FlushBufferSymbol) {
      return () => this.#flushBuffer();
    } else if (prop === ClearSymbol) {
      return () => this.#clear();
    }
    return this.#component.currentState[prop];
  }

  set(target:any, prop:PropertyKey, value:any, receiver:IProps):boolean {
    this.#component.writableState[prop] = value;
    return true;
  }

  /**
   * Proxy.ownKeys
   */
  ownKeys(target:IProps):(symbol|string)[] {
    if (typeof this.buffer !== "undefined") {
      return Reflect.ownKeys(this.buffer);
    } else {
      return this.#binds.map(({ prop }) => prop);
    }
  }

  /**
   * Proxy.getOwnPropertyDescriptor
   */
  getOwnPropertyDescriptor(target:IProps, prop:string|symbol):PropertyDescriptor { // プロパティ毎に呼ばれます
    return {
      enumerable: true,
      configurable: true
      /* ...other flags, probable "value:..."" */
    };
  }
}

export function createProps(component:IComponent):IProps {
  return new Proxy<Object>({}, new Handler(component)) as IProps;
}