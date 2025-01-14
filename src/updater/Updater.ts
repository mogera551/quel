import { config } from "../Config";
import { IComponent, IProcess } from "../component/types";
import { IBinding, INewBindingSummary } from "../binding/types";
import { IStatePropertyAccessor, IStateProxy } from "../state/types";
import { IUpdater } from "./types";
import { execProcesses } from "./execProcesses";
import { expandStateProperties } from "./expandStateProperties";
import { rebuildBindings } from "./rebuildBindings";
import { updateChildNodes } from "./updateChildNodes";
import { updateNodes } from "./updateNodes";
import { utils } from "../utils";
import { ILoopContext, ILoopContextStack, INamedLoopIndexesStack } from "../loopContext/types";
import { createLoopContextStack } from "../loopContext/createLoopContextStack";
import { createNamedLoopIndexesStack } from "../loopContext/createNamedLoopIndexesStack";

type IComponentForUpdater = Pick<IComponent, "quelState" | "quelBindingSummary" | "quelTemplate" | "quelInitialPromises">;

class Updater implements IUpdater {
  #component: IComponentForUpdater;
  processQueue: IProcess[] = [];
  updatedStateProperties: IStatePropertyAccessor[] = [];
  expandedStateProperties: IStatePropertyAccessor[] = [];
  updatedBindings: Set<IBinding> = new Set();
  bindingsForUpdateNode: IBinding[] = [];

  loopContextStack: ILoopContextStack = createLoopContextStack();
  namedLoopIndexesStack: INamedLoopIndexesStack = createNamedLoopIndexesStack();

  executing = false;

  get state(): IStateProxy {
    return this.#component.quelState;
  }

  get quelBindingSummary(): INewBindingSummary {
    return this.#component.quelBindingSummary;
  }

  get component(): IComponentForUpdater {
    return this.#component;
  }

  constructor(component:IComponentForUpdater) {
    this.#component = component;
  }

  addProcess(
    target: Function, 
    thisArgument: object | undefined, 
    argumentList: any[],
    loopContext?: ILoopContext
  ): void {
    this.processQueue.push({ target, thisArgument, argumentList, loopContext });
    if (this.executing) return;
    this.exec();
  }

  // 取得後processQueueは空になる
  retrieveAllProcesses(): IProcess[] {
    const allProcesses = this.processQueue;
    this.processQueue = [];
    return allProcesses;
  }

  addUpdatedStateProperty(accessor: IStatePropertyAccessor):void {
    this.updatedStateProperties.push(accessor);
    if (this.executing) return;
    this.exec();
  }

  // 取得後updateStatePropertiesは空になる
  retrieveAllUpdatedStateProperties(): IStatePropertyAccessor[] {
    const updatedStateProperties = this.updatedStateProperties;
    this.updatedStateProperties = [];
    return updatedStateProperties;
  }

  async execCallbackWithPerformance(callback: () => any): Promise<void> {
    this.executing = true;
    const uuid = this.#component.quelTemplate.dataset["uuid"];
    config.debug && performance.mark(`Updater#${uuid}.exec:start`);
    try {
      await callback();
    } finally {
      if (config.debug) {
        performance.mark(`Updater#${uuid}.exec:end`)
        performance.measure(`Updater#${uuid}.exec`, `Updater#${uuid}.exec:start`, `Updater#${uuid}.exec:end`);
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures(`Updater#${uuid}.exec`);
        performance.clearMarks(`Updater#${uuid}.exec:start`);
        performance.clearMarks(`Updater#${uuid}.exec:end`);
      }
      this.executing = false;
    }
  }

  async exec():Promise<void> {
    await this.execCallbackWithPerformance(async () => {
      while(this.processQueue.length > 0 || this.updatedStateProperties.length > 0) {
        const getInitialPromises = async () => this.component.quelInitialPromises;
        await getInitialPromises?.();

        this.updatedBindings.clear();

        // 戻り値は更新されたStateのプロパティ情報
        const _updatedStatePropertyAccessors = await execProcesses(this, this.state);
        const updatedKeys = _updatedStatePropertyAccessors.map(propertyAccessor => 
          propertyAccessor.pattern + "\t" + (propertyAccessor.loopIndexes?.toString() ?? ""));
        // 戻り値は依存関係により更新されたStateのプロパティ情報
        const updatedStatePropertyAccesses = expandStateProperties(this, this.state, _updatedStatePropertyAccessors);

        // バインディングの再構築
        rebuildBindings(this, this.quelBindingSummary, updatedStatePropertyAccesses, updatedKeys);

        // リスト要素の更新
        updateChildNodes(this, this.quelBindingSummary, updatedStatePropertyAccesses);

        // ノードの更新
        updateNodes(this, this.quelBindingSummary, updatedStatePropertyAccesses);

      }
    });
  }

  applyNodeUpdatesByBinding(
    binding: IBinding, 
    callback: (updater:IUpdater) => void
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

export function createUpdater(component:IComponentForUpdater):IUpdater {
  return new Updater(component);
}
