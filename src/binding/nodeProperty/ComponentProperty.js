import "../../types.js";
import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../../Symbols.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

export class BindingPropertyAccess {
  /** @type {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} */
  #viewModelProperty;

  /** @type {string} */
  get name() {
    return this.#viewModelProperty.name;
  }

  /** @type {number[]} */
  get indexes() {
    return this.#viewModelProperty.indexes;
  }

  /** @type {import("../../loopContext/LoopContext.js").LoopContext} */
  get loopContext() {
    return this.#viewModelProperty.binding.loopContext;
  }
  /**
   * 
   * @param {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelProperty
   */
  constructor(viewModelProperty) {
    this.#viewModelProperty = viewModelProperty;
  }
}

export class ComponentProperty extends ElementBase {
  /** @type {string} */
  get propName() {
    return this.nameElements[1];
  }

  /** @type {boolean} */
  get applicable() {
    return true;
  }

  /** @type {Component} */
  get thisComponent() {
    return this.node;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {HTMLInputElement} node 
   * @param {string} name 
   * @param {FilterInfo[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node.constructor[Symbols.isComponent])) utils.raise("ComponentProperty: not Component");
    super(binding, node, name, filters);
  }

  get value() {
    return super.value;
  }
  set value(value) {
//    console.log(`componentProperty: props.${this.propName} = ${value}`);
//    if (typeof this.thisComponent.viewModel === "undefined") {
//      console.log("this.thisComponent.viewModel is undefined.");
//    }
    this.thisComponent.viewModel?.[Symbols.updatedCallback]([[`${this.propName}`, []]]); 
    this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](this.propName, []);
  }
  /**
   * 初期化処理
   * コンポーネントプロパティのバインドを行う
   */
  initialize() {
    this.thisComponent.props[Symbols.bindProperty](this.propName, new BindingPropertyAccess(this.binding.viewModelProperty));
  }

  /**
   * 更新後処理
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  postUpdate(propertyAccessByViewModelPropertyKey) {
    const viewModelProperty = this.binding.viewModelProperty.name;
    const propName = this.propName;
    for(const [key, propertyAccess] of propertyAccessByViewModelPropertyKey.entries()) {
      if (propertyAccess.propName.name === viewModelProperty || propertyAccess.propName.setOfParentPaths.has(viewModelProperty)) {
        const remain = propertyAccess.propName.name.slice(viewModelProperty.length);
//        console.log(`componentProperty:postUpdate(${propName}${remain})`);
        this.thisComponent.viewModel?.[Symbols.updatedCallback]([[`${propName}${remain}`, propertyAccess.indexes]]);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`${propName}${remain}`, propertyAccess.indexes);
      }
    }
  }

  /** 
   * @param {any} value
   */
  isSameValue(value) {
    return false;
  }

}