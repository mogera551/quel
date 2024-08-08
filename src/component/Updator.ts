import "../types.js";
import { Symbols } from "../Symbols.js";
import { StateHandlerBase } from "../State/StateBaseHandler.js";
import { config } from "../Config.js";
import { IComponent } from "./types.js";
import { State } from "../state/types.js";

class Process {
  target:any;
  thisArgument:any;
  argumentList = [];
}

/** @typedef {(prop:PropertyAccess)=>string} PropAccessKey */
/** @type {PropAccessKey} */
const getPropAccessKey = (prop) => prop.propName.name + "\t" + prop.indexes.toString();
/** @type {(process:Process)=>()=>Promise<void>} */
const executeProcess = (process) => async () => Reflect.apply(process.target, process.thisArgument, process.argumentList);
/** @type {(a:ViewModelProperty,b:ViewModelProperty)=>number} */
const compareExpandableBindings = (a, b) => a.viewModelProperty.propertyName.level - b.viewModelProperty.propertyName.level;

export class Updator {
  component:IComponent;
  state:State;
  /** @type {Process[]} */
  processQueue = [];
  /** @type {PropertyAccess[]} */
  updatedStateProperties = [];
  /** @type {PropertyAccess[]} */ 
  expandedStateProperties = [];
  /** @type {Set<Binding>} */
  updatedBindings = new Set();

  executing = false;

  constructor(component:IComponent) {
    this.component = component;
  }

  /**
   * 
   * @param {()=>any} target 
   * @param {object} thisArgument 
   * @param {any[]} argumentList 
   * @param {{ processQueue:Process[], executing:boolean }} param3 
   * @returns 
   */
  addProcess(target, thisArgument, argumentList, { processQueue, executing } = this) {
    processQueue.push({ target, thisArgument, argumentList });
    if (executing) return;
    this.exec();
  }

  /**
   * 
   * @param {{ processQueue:Process[] }} param0
   * @returns {Process[]}
   */
  getProcessQueue({ processQueue } = this) {
    return processQueue;
  }

  /**
   * 
   * @param {PropertyAccess} prop
   * @param {{ updatedStateProperties:PropertyAccess[] }} param1 
   */
  addUpdatedStateProperty(prop, { updatedStateProperties } = this) {
    updatedStateProperties.push(prop);
  }

  /**
   * 
   * @param {{ component:Component, processQueue:Process[], updatedStateProperties:PropertyAccess[] }} param0 
   * @returns {Promise<PropertyAccess[]>}
   */
  async process({ component, processQueue, updatedStateProperties } = this) {
    const totalUpdatedStateProperties = [];
    // event callback, and update state
    while (processQueue.length > 0) {
      const processes = processQueue.slice(0);
      processQueue.length = 0;
      for(let i = 0; i < processes.length; i++) {
        await component.writableViewModelCallback(executeProcess(processes[i]))
      }
      if (updatedStateProperties.length > 0) {
        // call updatedCallback, and add processQeueue
        component.writableViewModel[Symbols.updatedCallback](updatedStateProperties);
        totalUpdatedStateProperties.push(...updatedStateProperties);
        updatedStateProperties.length = 0;
      }
    }
    // cache clear
    component.readOnlyViewModel[Symbols.clearCache]();
    return totalUpdatedStateProperties;
  }

  /**
   * 
   * @param {PropertyAccess[]} updatedStateProperties 
   * @param {{ component:Component }} param1 
   */
  expandStateProperties(updatedStateProperties, { component } = this) {
    // expand state properties
    const expandedStateProperties = updatedStateProperties.slice(0);
    for(let i = 0; i < updatedStateProperties.length; i++) {
      expandedStateProperties.push(...ViewModelHandlerBase.makeNotifyForDependentProps(
        component.readOnlyViewModel, updatedStateProperties[i]
      ));
    }
    return expandedStateProperties;
  }

  /**
   * 
   * @param {Map<string,PropertyAccess>} expandedStatePropertyByKey 
   * @param {{ component:Component }} param1 
   */
  rebuildBinding(expandedStatePropertyByKey, { component } = this) {
    // bindingの再構築
    // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
    // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
    // 再構築する際、branch、repeatの子ノードは更新する
    // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
    const bindingSummary = component.bindingSummary;
    /** @type {Binding[]} */
    const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
    bindingSummary.update((bindingSummary) => {
      for(let i = 0; i < expandableBindings.length; i++) {
        const binding = expandableBindings[i];
        if (!bindingSummary.exists(binding)) continue;
        if (expandedStatePropertyByKey.has(binding.viewModelProperty.key)) {
          binding.applyToNode();
        }
      }
    });
  }

  /**
   * 
   * @param {PropertyAccess[]} expandedStateProperties 
   * @param {{ component:Component, updatedBindings:Set<binding> }} param1 
   */
  updateChildNodes(expandedStateProperties, { component } = this) {
    const bindingSummary = component.bindingSummary;
    /** @type {Map<string,Set<number>>} */
    const setOfIndexByParentKey = new Map;
    for(const propertyAccess of expandedStateProperties) {
      if (propertyAccess.propName.lastPathName !== "*") continue;
      const lastIndex = propertyAccess.indexes?.at(-1);
      if (typeof lastIndex === "undefined") continue;
      const parentKey = propertyAccess.propName.parentPath + "\t" + propertyAccess.indexes.slice(0, -1);
      setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
    }
    for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
      for(const binding of bindingSummary.bindingsByKey.get(parentKey) ?? new Set) {
        binding.applyToChildNodes(setOfIndex);
      }
    }
  }

  /**
   * 
   * @param {Map<string,PropertyAccess>} expandedStatePropertyByKey 
   * @param {{ component:Component, updatedBindings:Set<binding> }} param1 
   */
  updateNode(expandedStatePropertyByKey, { component } = this) {
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
  /**
   * 
   * @param {()=>any} callback 
   */
  async execCallback(callback) {
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

  /**
   * 
   * @param {{ updatedBindings:Set<Binding>, component:Component }} param0 
   */
  async exec({ updatedBindings, component } = this) {
    await this.execCallback(async () => {
      while(this.getProcessQueue().length > 0) {
        updatedBindings.clear();
        component.contextRevision++;

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

  /**
   * 
   * @param {Binding} binding 
   * @param {(updator:Updator)=>any} callback 
   * @param {{ updatedBindings:Set<Binding> }} param2
   * @returns {void}
   */
  applyNodeUpdatesByBinding(binding, callback, { updatedBindings } = this) {
    if (updatedBindings.has(binding)) return;
    try {
      callback(this);
    } finally {
      updatedBindings.add(binding);
    }
  }
}
