import { ClearCacheApiSymbol } from "./symbols";
import { createReadonlyState } from "./createReadonlyState";
import { IStates, IStateProxy, IComponentForHandler } from "./types";
import { createWritableState } from "./createWritableState";
import { utils } from "../utils";


class States implements IStates {
  #base: Object;
  #readonlyState: IStateProxy;
  #writableState: IStateProxy;
  #_writable = false;
  #uuid: string;
  constructor(
    base: Object,
    readOnlyState: IStateProxy,
    writableState: IStateProxy,
    uuid: string
  ) {
    this.#base = base;
    this.#readonlyState = readOnlyState;
    this.#writableState = writableState;
    this.#uuid = uuid;
  }

  get base():Object {
    return this.#base;
  }

  get #writable(): boolean {
    return this.#_writable;
  }
  set #writable(value:boolean) {
    const uuid = this.#uuid;
    this.#_writable = value;
    if (value === false) {
      this.#readonlyState[ClearCacheApiSymbol]();
    }
    console.log(`States#${uuid}.#writable = ${this.#writable}`);
  }

  get current(): IStateProxy {
    return this.#writable ? this.#writableState : this.#readonlyState;
  }

  async asyncSetWritable(callback: () => Promise<any>): Promise<any> {
    const uuid = this.#uuid;
    if (this.#writable) utils.raise(`States#${uuid}: already writable`);
    console.log(`States#${uuid}: set writable`);
    this.#writable = true;
    try {
      return await callback();
    } finally {
      this.#writable = false;
      console.log(`States#${uuid}: unset writable`);
//      console.log(`States#${uuid}.#writable = ${this.#writable}`);
    }
  }

  setWritable(callback: () => any): any {
    if (this.#writable) utils.raise("States: already writable");
    this.#writable = true;
    try {
      return callback();
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
  return new States(base, readOnlyState, writableState, component.template.dataset["uuid"] ?? "");
}
