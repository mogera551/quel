import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../../Symbols.js";
import { utils } from "../../utils.js";
import { ElementBase } from "./ElementBase.js";

class PropertyAccess {
  get name() {
    return this.#viewModelProperty.name;
  }

  get indexes() {
    return this.#viewModelProperty.indexes;
  }
  /** @type {import("../viewModelProperty/ViewModelProperty.js").ViewModelProperty} */
  #viewModelProperty;
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
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, node, name, filters, filterFuncs) {
    if (!(node[Symbols.isComponent])) utils.raise("not Component");
    super(binding, node, name, filters, filterFuncs);
  }

  /**
   * 初期化処理
   * DOM要素にイベントハンドラの設定を行う
   */
  initialize() {
    this.thisComponent.props[Symbols.bindProperty](this.propName, new PropertyAccess(this.binding.viewModelProperty));
    Object.defineProperty(this.thisComponent.viewModel, this.propName, {
      get: ((propName) => function () { return this.$props[propName]; })(this.propName),
      set: ((propName) => function (value) { this.$props[propName] = value; })(this.propName),
      configurable: true,
    });
  }

  /**
   * 更新前処理
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  beforeUpdate(setOfUpdatedViewModelPropertyKeys) {
    const viewModelProperty = this.binding.viewModelProperty.name;
    const propName = this.propName;
    for(const key of setOfUpdatedViewModelPropertyKeys) {
      const [ name, indexesString ] = key.split("\t");
      if (name === viewModelProperty || PropertyName.create(name).setOfParentPaths.has(viewModelProperty)) {
        const remain = name.slice(viewModelProperty.length);
        const indexes = ((indexesString || null)?.split(",") ?? []).map(i => Number(i));
        this.thisComponent.viewModel?.[Symbols.writeCallback](`$props.${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.writeCallback](`${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`$props.${propName}${remain}`, indexes);
        this.thisComponent.viewModel?.[Symbols.notifyForDependentProps](`${propName}${remain}`, indexes);
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