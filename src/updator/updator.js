import "../types.js";
import { Symbols } from "../Symbols.js";
import { ViewModelHandlerBase } from "../viewModel/ViewModelHandlerBase.js";

class Process {
  target;
  thisArgument;
  argumentList = [];
}

/** @typedef {(prop:PropertyAccess)=>string} PropAccessKey */
/** @type {PropAccessKey} */
const getPropAccessKey = (prop) => prop.propName.name + "\t" + prop.indexes.toString();

const executeProcess = (process) => async () => Reflect.apply(process.target, process.thisArgument, process.argumentList);

export class Updator {
  /** @type {Component} */
  component;
  state;
  processQueue = [];
  /** @type {PropertyAccess[]} */
  updatedStateProperties = [];
  /** @type {PropertyAccess[]} */ 
  expandedStateProperties = [];
  /** @type {Set<Binding>} */
  updatedBindings = new Set();

  executing = false;

  constructor(component) {
    this.component = component;
  }

  addProcess(target, thisArgument, argumentList) {
    this.processQueue.push({ target, thisArgument, argumentList });
    if (this.executing) return;
    this.exec();
  }

  /**
   * 
   * @param {PropertyAccess} prop 
   */
  addUpdatedStateProperty(prop) {
    this.updatedStateProperties.push(prop);
  }

  async process() {
    const updatedStateProperties = [];
    // event callback, and update state
    while (this.processQueue.length > 0) {
      const processes = this.processQueue;
      this.processQueue = [];
      for(let i = 0; i < processes.length; i++) {
        const process = processes[i];
        await this.component.writableViewModelCallback(executeProcess(process))
      }
      // call updatedCallback, and add processQeueue
      this.component.writableViewModel[Symbols.updatedCallback](this.updatedStateProperties);
      updatedStateProperties.push(...this.updatedStateProperties);
      this.updatedStateProperties = [];
    }
    return updatedStateProperties;
  }

  async exec() {
    this.executing = true;
    try {
      this.updatedBindings.clear();

      // change to read only view model
      const updatedStateProperties = await this.process();

      // expand state properties
      const expandedStateProperties = updatedStateProperties.slice(0);
      for(let i = 0; i < updatedStateProperties.length; i++) {
        const prop = updatedStateProperties[i];
        expandedStateProperties.push(...ViewModelHandlerBase.makeNotifyForDependentProps(
          this.component.readOnlyViewModel, prop
        ));
      }
      const expandedStatePropertyByKey = 
        new Map(expandedStateProperties.map(prop => [getPropAccessKey(prop), prop]));

      // bindingの再構築
      // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
      // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
      // 再構築する際、branch、repeatの子ノードは更新する
      // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
      const bindingSummary = this.component.bindingSummary;
      /** @type {Binding[]} */
      const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(
        /** @type {(a:Binding,b:Binding)=>number} */
        (a, b) => a.viewModelProperty.propertyName.level - b.viewModelProperty.propertyName.level
      );
      bindingSummary.initUpdate();
      for(let i = 0; i < expandableBindings.length; i++) {
        const binding = expandableBindings[i];
        if (expandedStatePropertyByKey.has(binding.viewModelProperty.key)) {
          binding.applyToNode();
        }
      }
      bindingSummary.flush();
      //expandedStateProperties.filter(prop => )

      const setOfIndexByParentKey = new Map;
      for(const propertyAccess of expandedStatePropertyByKey.values()) {
        if (propertyAccess.propName.lastPathName !== "*") continue;
        const lastIndex = propertyAccess.indexes?.at(-1);
        if (typeof lastIndex === "undefined") continue;
        const parentKey = propertyAccess.propName.parentPath + "\t" + propertyAccess.indexes.slice(0, propertyAccess.indexes.length - 1);
        setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
      }
      for(const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
        for(const binding of bindingSummary.bindingsByKey.get(parentKey) ?? new Set) {
          if (bindingSummary.updatedBindings.has(binding)) continue;
          if (!binding.expandable) continue;
          binding.applyToChildNodes(setOfIndex);
        }
      }
  
      // update view
      //   update node
      //   update select
      //   update component 
      const selectBindings = [];
      for(const key of expandedStatePropertyByKey.keys()) {
        const bindings = bindingSummary.bindingsByKey.get(key);
        if (typeof bindings === "undefined") continue;
        for(let i = 0; i < bindings.length; i++) {
          const binding = bindings[i];
          if (binding.expandable) continue;
          binding.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
        }
      }
      for(let i = 0; i < selectBindings.length; i++) {
        selectBindings[i].applyToNode();
      }
      for(const binding of bindingSummary.componentBindings) {
        binding.nodeProperty.postUpdate(expandedStatePropertyByKey);
      }
    } finally {
      this.executing = false;
    }

  } 
}
