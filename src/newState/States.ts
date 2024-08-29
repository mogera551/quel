import { ClearCacheApiSymbol } from "../@symbols/state";
import { INewComponent } from "../newComponent/types";
import { ReadonlyHandler } from "./ReadonlyHandler";
import { IStates, IStateProxy } from "./types";
import { WritableHandler } from "./WritableHandler";

type IComponentForHandler = Pick<INewComponent, "baseState" | "updator"> & HTMLElement;

class States implements IStates {
  #baseState: Object;
  #readonlyState: IStateProxy;
  #writableState: IStateProxy;
  #_writable = false;
  constructor(component: IComponentForHandler, baseState: Object) {
    this.#baseState = baseState;
    this.#readonlyState = new Proxy(baseState, new ReadonlyHandler(component)) as IStateProxy;
    this.#writableState = new Proxy(baseState, new WritableHandler(component)) as IStateProxy;
  }

  get base():Object {
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

export function createStates(component:IComponentForHandler, baseState: Object):IStates {
  return new States(component, baseState);
}
