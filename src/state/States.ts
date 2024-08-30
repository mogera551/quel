import { ClearCacheApiSymbol } from "../@symbols/state";
import { IComponent } from "../@types/component";
import { ReadonlyHandler } from "./ReadonlyHandler";
import { IStates, IStateProxy } from "../@types/state";
import { WritableHandler } from "./WritableHandler";

type IComponentForHandler = Pick<IComponent, "states" | "updator"> & HTMLElement;

class States implements IStates {
  #base: Object;
  #readonlyState: IStateProxy;
  #writableState: IStateProxy;
  #_writable = false;
  constructor(component: IComponentForHandler, base: Object) {
    this.#base = base;
    this.#readonlyState = new Proxy(base, new ReadonlyHandler(component, base)) as IStateProxy;
    this.#writableState = new Proxy(base, new WritableHandler(component, base)) as IStateProxy;
  }

  get base():Object {
    return this.#base;
  }

  get #writable(): boolean {
    return this.#_writable;
  }
  set #writable(value:boolean) {
    this.#_writable = value;
    if (value === false) {
      this.#readonlyState[ClearCacheApiSymbol]();
    }
  }

  get current(): IStateProxy {
    return this.#writable ? this.#writableState : this.#readonlyState;
  }

  async writable(callback: () => Promise<void>): Promise<void> {
    this.#writable = true;
    try {
      return await callback();
    } finally {
      this.#writable = false;
    }
  }
}

export function createStates(component:IComponentForHandler, base: Object):IStates {
  return new States(component, base);
}
