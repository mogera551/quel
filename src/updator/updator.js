import "../types.js";
import { Symbols } from "../Symbols.js";
import { ViewModelHandlerBase } from "../viewModel/ViewModelHandlerBase.js";

export class Process {
  target;
  thisArgument;
  argumentList = [];
}

class Updator {
  /** @type {Component} */
  component;
  state;
  processQueue = [];
  /** @type {PropertyAccess[]} */
  updatedStateProperties = [];
  /** @type {PropertyAccess[]} */
  expandedStateProperties = [];
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

  async exec() {
    this.executing = true;
    try {
      const updatedStateProperties = [];
      // event callback, and update state
      while (this.processQueue.length > 0) {
        const processes = this.processQueue;
        this.processQueue = [];
        for(let i = 0; i < processes.length; i++) {
          const process = processes[i];
          await Reflect.apply(process.target, process.thisArgument, process.argumentList);
        }
        // call updatedCallback, and add processQeueue
        this.component.writableViewModel[Symbols.updatedCallback](this.updatedStateProperties);
        updatedStateProperties.push(...this.updatedStateProperties);
        this.updatedStateProperties = [];
      }
      // expand state properties
      const expandedStateProperties = updatedStateProperties.slice(0);
      for(let i = 0; i < updatedStateProperties.length; i++) {
        const prop = updatedStateProperties[i];
        expandedStateProperties.push(...ViewModelHandlerBase.makeNotifyForDependentProps(
          this.component.readOnlyViewModel, prop
        ));
      }
      const expandedStatePropertyByKey = 
        new Map(expandedStateProperties.map(prop => [prop.propName.name + "\t" + prop.indexes.toString(), prop]));

      // bindingの再構築
      // expandedStatePropertiesに、branch、repeatが含まれている場合、それらのbindingを再構築する
      // 再構築する際、branch、repeatの子ノードは更新する
      // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
      const bindingSummary = this.component.bindingSummary;
      /** @type {Binding[]} */
      const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(
        /** @type {(a:Binding,b:Binding)=>number} */
        (a, b) => a.viewModelProperty.propertyName.level - b.viewModelProperty.propertyName.level
      );
      for(let i = 0; i < expandableBindings.length; i++) {
        const binding = expandableBindings[i];
        if (expandedStatePropertyByKey.has(binding.viewModelProperty.key)) {
          binding.expand();
        }
      }
      //expandedStateProperties.filter(prop => )

      // update view
      //   update node
      //   update select
      //   update component 


  
    } finally {
      this.executing = false;
    }

  } 
}
