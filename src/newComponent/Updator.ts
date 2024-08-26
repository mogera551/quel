import { utils } from "../utils";
import { IComponent, IProcess, IUpdator } from "../@types/component";
import { IBinding, IPropertyAccess } from "../@types/binding";
import { ClearCacheApiSymbol, UpdatedCallbackSymbol } from "../@symbols/state";
import { StateBaseHandler } from "../state/StateBaseHandler";
import { config } from "../Config";

const getPropAccessKey = (prop:IPropertyAccess):string => prop.patternName + "\t" + prop.indexes.toString();
const executeProcess = (process:IProcess) => async ():Promise<void> => Reflect.apply(process.target, process.thisArgument, process.argumentList);
const compareExpandableBindings = (a:IBinding, b:IBinding):number => a.stateProperty.patternName.level - b.stateProperty.patternName.level;

export class Updator implements IUpdator {
  component:IComponent;
  processQueue:IProcess[] = [];
  updatedStateProperties:IPropertyAccess[] = [];
  expandedStateProperties:IPropertyAccess[] = [];
  updatedBindings:Set<IBinding> = new Set();

  executing = false;

  constructor(component:IComponent) {
    this.component = component;
  }

  addProcess(target:Function, thisArgument:object, argumentList:any[]):void {
    this.processQueue.push({ target, thisArgument, argumentList });
    if (this.executing) return;
    this.exec();
  }

  getProcessQueue():IProcess[] {
    return this.processQueue;
  }

  addUpdatedStateProperty(prop:IPropertyAccess):void {
    this.updatedStateProperties.push(prop);
  }

  /**
   * 
   * @param {{ component:Component, processQueue:Process[], updatedStateProperties:PropertyAccess[] }} param0 
   * @returns {Promise<PropertyAccess[]>}
   */
  async process():Promise<IPropertyAccess[]> {

    const totalUpdatedStateProperties:IPropertyAccess[] = [];
    // event callback, and update state
    while (this.processQueue.length > 0) {
      const processes = this.processQueue.slice(0);
      this.processQueue.length = 0;
      for(let i = 0; i < processes.length; i++) {
        await this.component.stateWritable(executeProcess(processes[i]));
      }
      if (this.updatedStateProperties.length > 0) {
        // call updatedCallback, and add processQeueue
        this.component.writableState[UpdatedCallbackSymbol](this.updatedStateProperties);
        totalUpdatedStateProperties.push(...this.updatedStateProperties);
        this.updatedStateProperties.length = 0;
      }
    }
    // cache clear
    this.component.readonlyState[ClearCacheApiSymbol]();
    return totalUpdatedStateProperties;
  }

  expandStateProperties(updatedStateProperties:IPropertyAccess[]):IPropertyAccess[] {
    // expand state properties
    const expandedStateProperties = updatedStateProperties.slice(0);
    for(let i = 0; i < updatedStateProperties.length; i++) {
      expandedStateProperties.push(...StateBaseHandler.makeNotifyForDependentProps(
        this.component.readonlyState, updatedStateProperties[i]
      ));
    }
    return expandedStateProperties;
  }

  rebuildBinding(expandedStatePropertyByKey:Map<string,IPropertyAccess>) {
    // bindingの再構築
    // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
    // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
    // 再構築する際、branch、repeatの子ノードは更新する
    // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
    const component = this.component;
    const bindingSummary = component.bindingSummary;
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

  updateChildNodes(expandedStateProperties:IPropertyAccess[]) {
    const component = this.component;
    const bindingSummary = component.bindingSummary;
    const setOfIndexByParentKey:Map<string,Set<number>> = new Map;
    for(const propertyAccess of expandedStateProperties) {
      if (propertyAccess.patternNameInfo.lastPathName !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.patternNameInfo.parentPath + "\t" + propertyAccess.indexes.slice(0, -1);
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

  updateNode(expandedStatePropertyByKey:Map<string,IPropertyAccess>) {
    const component = this.component;
    const bindingSummary = component.bindingSummary;
    const selectBindings = [];
    for(const key of expandedStatePropertyByKey.keys()) {
      const bindings = bindingSummary.bindingsByKey.get(key);
      if (typeof bindings === "undefined") continue;
      for(let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        binding.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
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

  applyNodeUpdatesByBinding(binding:IBinding, callback:(updator:IUpdator)=>void):void {
    if (this.updatedBindings.has(binding)) return;
    try {
      callback(this as IUpdator);
    } finally {
      this.updatedBindings.add(binding);
    }
  }
}
