import { ClearCacheApiSymbol } from "./symbols";
import { IComponent } from "../component/types";
import { createReadonlyState, ReadonlyHandler } from "./createReadonlyState";
import { IStates, IStateProxy, IComponentForHandler } from "./types";
import { createWritableState, WritableHandler } from "./createWritableState";
import { utils } from "../utils";


class States implements IStates {
  #base: Object;
  #readonlyState: IStateProxy;
  #writableState: IStateProxy;
  #_writable = false;
  constructor(
    component: IComponentForHandler, 
    base: Object,
    readOnlyState: IStateProxy,
    writableState: IStateProxy
  ) {
    this.#base = base;
    this.#readonlyState = readOnlyState;
    this.#writableState = writableState;
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
    if (this.#writable) utils.raise("States: already writable");
    this.#writable = true;
    try {
      return await callback();
    } finally {
      this.#writable = false;
    }
  }
}

export function createStates(
  component:IComponentForHandler, 
  base: Object,
  readOnlyState: IStateProxy = createReadonlyState(component, base),
  writableState: IStateProxy = createWritableState(component, base)
): IStates {
  return new States(component, base, readOnlyState, writableState);
}
