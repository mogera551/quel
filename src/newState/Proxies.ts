import { ClearCacheApiSymbol } from "../@symbols/state";
import { INewComponent } from "../newComponent/types";
import { ReadonlyHandler } from "./ReadonlyHandler";
import { IProxies, IStateProxy } from "./types";
import { WritableHandler } from "./WritableHandler";

class Proxies implements IProxies {
  #baseState: Object;
  #readonlyState: IStateProxy;
  #writableState: IStateProxy;
  #_writable = false;
  constructor(component: INewComponent, baseState: Object) {
    this.#baseState = baseState;
    this.#readonlyState = new Proxy(baseState, new ReadonlyHandler(component)) as IStateProxy;
    this.#writableState = new Proxy(baseState, new WritableHandler(component)) as IStateProxy;
  }

  get baseState():Object {
    return this.#baseState;
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

  get state(): IStateProxy {
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

export function createProxies(component:INewComponent, baseState: Object):IProxies {
  return new Proxies(component, baseState);
}
