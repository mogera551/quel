import { utils } from "../utils";
import { GetDirectSymbol, SetDirectSymbol } from "../dotNotation/symbols";
import { CreateBufferApiSymbol, FlushBufferApiSymbol, NotifyForDependentPropsApiSymbol } from "../state/symbols";
import { BindPropertySymbol, ClearBufferSymbol, ClearSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";
import { IComponent, IProps } from "./types";
import { IBindingPropertyAccess } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";

const RE_CONTEXT_INDEX = new RegExp(/^\$([0-9]+)$/);

type IComponentForProps = Pick<IComponent, "parentComponent" | "states"> & HTMLElement;

function getPopoverContextIndexes(component:IComponentForProps): number[] | undefined {
  return component.parentComponent?.popoverContextIndexesById?.get(component.id);
}

const contextLoopIndexes = (handler:Handler, props:IBindingPropertyAccess): number[] => {
  let indexes;
  const patternInfo = getPatternInfo(props.name);
  if (patternInfo.wildcardPaths.length > 0 && props.indexes.length === 0 && handler.component.hasAttribute("popover")) {
    indexes = getPopoverContextIndexes(handler.component)?.slice(0 , patternInfo.wildcardPaths.length);
  }
  return indexes ?? props.indexes;
}

class Handler implements ProxyHandler<IProps> {

  constructor(component: IComponentForProps) {
    this.#component = component;
  }

  #component: IComponentForProps;
  get component(): IComponentForProps {
    return this.#component;
  }

  #buffer?:{[key: string]: any};
  get buffer() {
    return this.#buffer;
  }

  #binds:{prop: string, propAccess: IBindingPropertyAccess}[] = [];
  get binds(): {prop: string, propAccess: IBindingPropertyAccess}[] {
    return this.#binds;
  }

  #saveBindProperties:{[key: string]: any} = {};

  /**
   * bind parent component's property
   */
  #bindProperty(prop: string, propAccess?: IBindingPropertyAccess) {
    const getFunc = (handler: Handler, name: string, props?: IBindingPropertyAccess) => function () {
      if (typeof handler.buffer !== "undefined") {
        return handler.buffer[name];
      } else {
        if (typeof props === "undefined") utils.raise(`PropertyAccess is required`);
        const match = RE_CONTEXT_INDEX.exec(props.name);
        if (match) {
          const loopIndex = Number(match[1]) - 1;
          let indexes = props.loopContext?.indexes ?? []; // todo: loopContextがundefinedの場合の処理
          if (indexes.length === 0 && handler.component.hasAttribute("popover")) {
            indexes = getPopoverContextIndexes(handler.component) ?? [];
          }
          return indexes[loopIndex];
        } else {
          const loopIndexes = contextLoopIndexes(handler, props);
          return handler.component.parentComponent?.states.current[GetDirectSymbol](props.name, loopIndexes) ?? utils.raise(`Property ${props.name} is not found`); // todo: 例外処理
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
        handler.component.parentComponent?.states.writable(async () => {
          handler.component.parentComponent?.states.current[SetDirectSymbol](props.name, loopIndexes, value) ?? utils.raise(`Property ${props.name} is not found`); // todo: 例外処理
        });
      }
      return true;
    };
    // save
    this.#saveBindProperties[prop] = Object.getOwnPropertyDescriptor(this.#component.states.base, prop) ?? {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    };

    // define component's property
    Object.defineProperty(this.#component.states.base, prop, {
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
      this.#component.states.current[NotifyForDependentPropsApiSymbol](key, []);
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
    // ToDo: as INewComponentを修正する
    buffer = this.#component.parentComponent?.states.current[CreateBufferApiSymbol](this.#component as IComponent) ?? utils.raise(`CreateBufferApiSymbol is not found`);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      const loopIndexes = contextLoopIndexes(this, propAccess);
      buffer[prop] = this.#component.parentComponent?.states.current[GetDirectSymbol](propAccess.name, loopIndexes) ?? utils.raise(`Property ${propAccess.name} is not found`); // todo: 例外処理  
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const buffer = this.#buffer;
      this.#component.parentComponent?.states.writable(async () => {
        // ToDo: as INewComponentを修正する
        const result = this.#component.parentComponent?.states.current[FlushBufferApiSymbol](buffer, this.#component as IComponent) ?? utils.raise(`FlushBufferApiSymbol is not found`);
        if (result !== true) {
          this.#binds.forEach(({ prop, propAccess }) => {
            const loopIndexes = contextLoopIndexes(this, propAccess);
            this.#component.parentComponent?.states.current[SetDirectSymbol](propAccess.name, loopIndexes, buffer[prop]) ?? utils.raise(`Property ${propAccess.name} is not found`); // todo: 例外処理  
          });
        }
      });
    }
  }

  #clear() {
    this.#buffer = undefined;
    this.#binds = [];
    for(const [key, desc] of Object.entries(this.#saveBindProperties)) {
      Object.defineProperty(this.#component.states.base, key, desc);
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
    return this.#component.states.current[prop];
  }

  set(target:any, prop:PropertyKey, value:any, receiver:IProps):boolean {
    this.#component.states.writable(async () => {
      this.#component.states.current[prop] = value;
    });
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

/**
 * コンポーネント間のアクセスをするためのプロパティを作成します
 * @param component {IComponentForProps} コンポーネント
 * @returns {IProps} プロパティ
 */
export function createProps(component: IComponentForProps): IProps {
  return new Proxy<Object>({}, new Handler(component)) as IProps;
}