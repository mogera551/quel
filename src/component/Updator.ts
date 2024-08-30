import { UpdatedCallbackSymbol } from "../@symbols/state";
import { config } from "../Config";
import { INewComponent, INewProcess, INewUpdator } from "./types";
import { INewBinding, INewBindingSummary, INewPropertyAccess } from "../binding/types";
import { makeNotifyForDependentProps } from "../state/MakeNotify";
import { IStates } from "../state/types";

const getPropAccessKey = (prop: INewPropertyAccess):string => prop.pattern + "\t" + prop.indexes.toString();
const executeProcess = (process: INewProcess) => async (): Promise<void> => Reflect.apply(process.target, process.thisArgument, process.argumentList);
const compareExpandableBindings = (a: INewBinding, b: INewBinding): number => a.stateProperty.propInfo.wildcardCount - b.stateProperty.propInfo.wildcardCount;

type IComponentForUpdator = Pick<INewComponent, "states" | "bindingSummary" | "contextRevision">;

class Updator implements INewUpdator {
  #component: IComponentForUpdator;
  processQueue: INewProcess[] = [];
  updatedStateProperties: INewPropertyAccess[] = [];
  expandedStateProperties: INewPropertyAccess[] = [];
  updatedBindings: Set<INewBinding> = new Set();

  executing = false;

  get states(): IStates {
    return this.#component.states;
  }

  get bindingSummary(): INewBindingSummary {
    return this.#component.bindingSummary;
  }

  get component(): IComponentForUpdator {
    return this.#component;
  }

  constructor(component:IComponentForUpdator) {
    this.#component = component;
  }

  addProcess(target:Function, thisArgument:object, argumentList:any[]):void {
    this.processQueue.push({ target, thisArgument, argumentList });
    if (this.executing) return;
    this.exec();
  }

  getProcessQueue():INewProcess[] {
    return this.processQueue;
  }

  addUpdatedStateProperty(prop:INewPropertyAccess):void {
    this.updatedStateProperties.push(prop);
  }

  /**
   * 
   * @param {{ component:Component, processQueue:Process[], updatedStateProperties:PropertyAccess[] }} param0 
   * @returns {Promise<PropertyAccess[]>}
   */
  async process(): Promise<INewPropertyAccess[]> {

    const totalUpdatedStateProperties:INewPropertyAccess[] = [];
    // event callback, and update state
    while (this.processQueue.length > 0) {
      const processes = this.processQueue.slice(0);
      this.processQueue.length = 0;
      for(let i = 0; i < processes.length; i++) {
        await this.states.writable(executeProcess(processes[i]));
      }
      if (this.updatedStateProperties.length > 0) {
        // call updatedCallback, and add processQeueue
        await this.states.writable(async () => {
          this.states.current[UpdatedCallbackSymbol](this.updatedStateProperties);
          totalUpdatedStateProperties.push(...this.updatedStateProperties);
          this.updatedStateProperties.length = 0;
        });
      }
    }
    // ToDo: 要検討
    // cache clear
    // this.states.current[ClearCacheApiSymbol]();
    return totalUpdatedStateProperties;
  }

  expandStateProperties(updatedStateProperties:INewPropertyAccess[]):INewPropertyAccess[] {
    // expand state properties
    const expandedStateProperties = updatedStateProperties.slice(0);
    for(let i = 0; i < updatedStateProperties.length; i++) {
      expandedStateProperties.push(...makeNotifyForDependentProps(
        this.states.current, updatedStateProperties[i]
      ));
    }
    return expandedStateProperties;
  }

  rebuildBinding(expandedStatePropertyByKey:Map<string,INewPropertyAccess>) {
    // bindingの再構築
    // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
    // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
    // 再構築する際、branch、repeatの子ノードは更新する
    // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
    const bindingSummary = this.bindingSummary;
    const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
    bindingSummary.update((bindingSummary) => {
      for(let i = 0; i < expandableBindings.length; i++) {
        const binding = expandableBindings[i];
        if (!bindingSummary.exists(binding)) continue;
        if (expandedStatePropertyByKey.has(binding.stateProperty.key)) {
          binding.applyToNode();
        }
      }
    });
  }

  updateChildNodes(expandedStateProperties:INewPropertyAccess[]) {
    const bindingSummary = this.bindingSummary;
    const setOfIndexByParentKey:Map<string,Set<number>> = new Map;
    for(const propertyAccess of expandedStateProperties) {
      if (propertyAccess.propInfo.patternElements.at(-1) !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.propInfo.patternPaths.at(-2) + "\t" + propertyAccess.indexes.slice(0, -1);
      setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
    }
    for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
      const bindings = bindingSummary.bindingsByKey.get(parentKey);
      if (typeof bindings === "undefined") continue;
      for(const binding of bindings) {
        binding.applyToChildNodes(setOfIndex);
      }
    }
  }

  updateNode(expandedStatePropertyByKey:Map<string,INewPropertyAccess>) {
    const bindingSummary = this.bindingSummary;
    const selectBindings = [];
    for(const key of expandedStatePropertyByKey.keys()) {
      const bindings = bindingSummary.bindingsByKey.get(key);
      if (typeof bindings === "undefined") continue;
      for(let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        binding.nodeProperty.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
    for(const binding of bindingSummary.componentBindings) {
      //if (updatedBindings.has(binding)) continue;
      binding.nodeProperty.postUpdate(expandedStatePropertyByKey);
    }
  }

  async execCallback(callback:()=>any):Promise<void> {
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
    await this.execCallback(async () => {
      while(this.getProcessQueue().length > 0) {
        this.updatedBindings.clear();
        this.component.contextRevision++;

        const updatedStateProperties = await this.process();
        const expandedStateProperties = this.expandStateProperties(updatedStateProperties);

        const expandedStatePropertyByKey = 
          new Map(expandedStateProperties.map(prop => [getPropAccessKey(prop), prop]));

        this.rebuildBinding(expandedStatePropertyByKey);
        this.updateChildNodes(expandedStateProperties);
        this.updateNode(expandedStatePropertyByKey);
      }
    });
  }

  applyNodeUpdatesByBinding(binding:INewBinding, callback:(updator:INewUpdator)=>void):void {
    if (this.updatedBindings.has(binding)) return;
    try {
      callback(this);
    } finally {
      this.updatedBindings.add(binding);
    }
  }
}

export function createUpdator(component:IComponentForUpdator):INewUpdator {
  return new Updator(component);
}