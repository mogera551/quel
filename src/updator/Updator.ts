import { config } from "../Config";
import { IComponent, IProcess } from "../component/types";
import { IBinding, IBindingSummary, INewBindingSummary, IPropertyAccess } from "../binding/types";
import { IStates } from "../state/types";
import { IUpdator } from "./types";
import { execProcesses } from "./execProcesses";
import { expandStateProperties } from "./expandStateProperties";
import { rebuildBindings } from "./rebuildBindings";
import { updateChildNodes } from "./updateChildNodes";
import { updateNodes } from "./updateNodes";
import { utils } from "../utils";

type IComponentForUpdator = Pick<IComponent, "states" | "newBindingSummary">;

class Updator implements IUpdator {
  #component: IComponentForUpdator;
  processQueue: IProcess[] = [];
  updatedStateProperties: IPropertyAccess[] = [];
  expandedStateProperties: IPropertyAccess[] = [];
  updatedBindings: Set<IBinding> = new Set();
  bindingsForUpdateNode: IBinding[] = [];

  executing = false;

  get states(): IStates {
    return this.#component.states;
  }

  get newBindingSummary(): INewBindingSummary {
    return this.#component.newBindingSummary;
  }

  get component(): IComponentForUpdator {
    return this.#component;
  }

  constructor(component:IComponentForUpdator) {
    this.#component = component;
  }

  addProcess(
    target: Function, 
    thisArgument: object | undefined, 
    argumentList: any[]
  ): void {
    this.processQueue.push({ target, thisArgument, argumentList });
    if (this.executing) return;
    this.exec();
  }

  // 取得後processQueueは空になる
  retrieveAllProcesses(): IProcess[] {
    const allProcesses = this.processQueue;
    this.processQueue = [];
    return allProcesses;
  }

  addUpdatedStateProperty(prop:IPropertyAccess):void {
    this.updatedStateProperties.push(prop);
  }

  // 取得後updateStatePropertiesは空になる
  retrieveAllUpdatedStateProperties() {
    const updatedStateProperties = this.updatedStateProperties;
    this.updatedStateProperties = [];
    return updatedStateProperties;
  }

  async execCallbackWithPerformance(callback: () => any): Promise<void> {
    this.executing = true;
    config.debug && performance.mark('Updator.exec:start');
    try {
      await callback();
    } finally {
      if (config.debug) {
        performance.mark('Updator.exec:end')
        performance.measure('Updator.exec', 'Updator.exec:start', 'Updator.exec:end');
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures('Updator.exec');
        performance.clearMarks('Updator.exec:start');
        performance.clearMarks('Updator.exec:end');
      }
      this.executing = false;
    }
  }

  async exec():Promise<void> {
    await this.execCallbackWithPerformance(async () => {
      while(this.processQueue.length > 0) {
        this.updatedBindings.clear();

        // 戻り値は更新されたStateのプロパティ情報
        const _updatedStatePropertyAccesses = await execProcesses(this, this.states);
        const updatedKeys = _updatedStatePropertyAccesses.map(propertyAccess => propertyAccess.key);
        // 戻り値は依存関係により更新されたStateのプロパティ情報
        const updatedStatePropertyAccesses = expandStateProperties(this.states, _updatedStatePropertyAccesses);

        const updatedStatePropertyAccessByKey: Map<string, IPropertyAccess> = 
          new Map(updatedStatePropertyAccesses.map(propertyAccess => [propertyAccess.key, propertyAccess]));

        rebuildBindings(this, this.newBindingSummary, updatedStatePropertyAccessByKey, updatedKeys);
        updateChildNodes(this, this.newBindingSummary, updatedStatePropertyAccesses)

        updateNodes(this.newBindingSummary, updatedStatePropertyAccessByKey);
//        gatherBindings("data.*.id", [10]);

      }
    });
  }

  applyNodeUpdatesByBinding(
    binding: IBinding, 
    callback: (updator:IUpdator) => void
  ): void {
    if (this.updatedBindings.has(binding)) return;
    try {
      callback(this);
    } finally {
      this.updatedBindings.add(binding);
    }
  }

  #isFullRebuild?: boolean;
  get isFullRebuild(): boolean {
    if (typeof this.#isFullRebuild === "undefined") utils.raise("fullRebuild is not set");
    return this.#isFullRebuild;
  }
  setFullRebuild(
    isFullRebuild:boolean, 
    callback: () => {}
  ): void {
    this.#isFullRebuild = isFullRebuild;
    try {
      callback();
    } finally {
      this.#isFullRebuild = undefined;
    }
  }
}

export function createUpdator(component:IComponentForUpdator):IUpdator {
  return new Updator(component);
}
