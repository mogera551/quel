import { config } from "../Config";
import { IComponent, IProcess } from "../component/types";
import { IBinding, INewBindingSummary } from "../binding/types";
import { IStatePropertyAccessor, IStateProxy } from "../state/types";
import { IUpdator } from "./types";
import { execProcesses } from "./execProcesses";
import { expandStateProperties } from "./expandStateProperties";
import { rebuildBindings } from "./rebuildBindings";
import { updateChildNodes } from "./updateChildNodes";
import { updateNodes } from "./updateNodes";
import { utils } from "../utils";
import { ILoopContext, ILoopContextStack, INamedLoopIndexesStack } from "../loopContext/types";
import { createLoopContextStack } from "../loopContext/createLoopContextStack";
import { createNamedLoopIndexesStack } from "../loopContext/createNamedLoopIndexesStack";

type IComponentForUpdator = Pick<IComponent, "state" | "newBindingSummary" | "template">;

class Updator implements IUpdator {
  #component: IComponentForUpdator;
  processQueue: IProcess[] = [];
  updatedStateProperties: IStatePropertyAccessor[] = [];
  expandedStateProperties: IStatePropertyAccessor[] = [];
  updatedBindings: Set<IBinding> = new Set();
  bindingsForUpdateNode: IBinding[] = [];

  loopContextStack: ILoopContextStack = createLoopContextStack();
  namedLoopIndexesStack: INamedLoopIndexesStack = createNamedLoopIndexesStack();

  executing = false;

  get state(): IStateProxy {
    return this.#component.state;
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
    const uuid = this.#component.template.dataset["uuid"];
    config.debug && performance.mark(`Updator#${uuid}.exec:start`);
    try {
      await callback();
    } finally {
      if (config.debug) {
        performance.mark(`Updator#${uuid}.exec:end`)
        performance.measure(`Updator#${uuid}.exec`, `Updator#${uuid}.exec:start`, `Updator#${uuid}.exec:end`);
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures(`Updator#${uuid}.exec`);
        performance.clearMarks(`Updator#${uuid}.exec:start`);
        performance.clearMarks(`Updator#${uuid}.exec:end`);
      }
      this.executing = false;
    }
  }

  async exec():Promise<void> {
    await this.execCallbackWithPerformance(async () => {
      while(this.processQueue.length > 0 || this.updatedStateProperties.length > 0) {
        this.updatedBindings.clear();

        // 戻り値は更新されたStateのプロパティ情報
        const _updatedStatePropertyAccessors = await execProcesses(this, this.state);
        const updatedKeys = _updatedStatePropertyAccessors.map(propertyAccessor => 
          propertyAccessor.pattern + "\t" + (propertyAccessor.loopIndexes?.toString() ?? ""));
        // 戻り値は依存関係により更新されたStateのプロパティ情報
        const updatedStatePropertyAccesses = expandStateProperties(this, this.state, _updatedStatePropertyAccessors);

        // バインディングの再構築
        rebuildBindings(this, this.newBindingSummary, updatedStatePropertyAccesses, updatedKeys);

        // リスト要素の更新
        updateChildNodes(this, this.newBindingSummary, updatedStatePropertyAccesses);

        // ノードの更新
        updateNodes(this, this.newBindingSummary, updatedStatePropertyAccesses);

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
