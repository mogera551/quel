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
    return false;
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
   * @param {Filter[]} filters 
   */
  constructor(binding, node, name, filters) {
    if (!(node.constructor[Symbols.isComponent])) utils.raise("ComponentProperty: not Component");
    super(binding, node, name, filters);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
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
        this.thisComponent.viewModel?.[Symbols.writeCallback](`${propName}${remain}`, propertyAccess.indexes);
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