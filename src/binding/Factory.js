import "../types.js";
import { utils } from "../utils.js";
import { Binding } from "./Binding.js";
import { Repeat } from "./nodeProperty/Repeat.js";
import { Branch } from "./nodeProperty/Branch.js";
import { ViewModelProperty } from "./ViewModelProperty.js";
import { NodeProperty } from "./nodeProperty/NodeProperty.js";
import { ElementClassName } from "./nodeProperty/ElementClassName.js"
import { Checkbox } from "./nodeProperty/Checkbox.js";
import { Radio } from "./nodeProperty/Radio.js";
import { ElementEvent } from "./nodeProperty/ElementEvent.js";
import { ElementClass } from "./nodeProperty/ElementClass.js";
import { ElementAttribute } from "./nodeProperty/ElementAttribute.js";
import { ElementStyle } from "./nodeProperty/ElementStyle.js";
import { ElementProperty } from "./nodeProperty/ElementProperty.js";
import { ComponentProperty } from "./nodeProperty/ComponentProperty.js";

export class Factory {
  // 面倒くさい書き方をしているのは、循環参照でエラーになるため
  // モジュール内で、const変数で書くとjestで循環参照でエラーになる
  static #classOfNodePropertyByNameByIsComment;
  static get classOfNodePropertyByNameByIsComment() {
    if (typeof this.#classOfNodePropertyByNameByIsComment === "undefined") {
      this.#classOfNodePropertyByNameByIsComment = {
        true: {
          "if": Branch,
          "loop": Repeat,
        },
        false: {
          "class": ElementClassName,
          "checkbox": Checkbox,
          "radio": Radio,
        }
      };
    }
    return this.#classOfNodePropertyByNameByIsComment;
  }
  static #classOfNodePropertyByFirstName;
  static get classOfNodePropertyByFirstName() {
    if (typeof this.#classOfNodePropertyByFirstName === "undefined") {
      this.#classOfNodePropertyByFirstName = {
        "class": ElementClass,
        "attr": ElementAttribute,
        "style": ElementStyle,
        "props": ComponentProperty,
      };
    }
    return this.#classOfNodePropertyByFirstName;

  }

  /**
   * 
   * @param {Component} component 
   * @param {Node} node 
   * @param {string} nodePropertyName 
   * @param {ViewModel} viewModel 
   * @param {string} viewModelPropertyName 
   * @param {Filter[]} filters 
   * @param {ContextInfo} context 
   * @returns {Binding}
   */
  static create(component, node, nodePropertyName, viewModel, viewModelPropertyName, filters, context) {
    /** @type {typeof NodeProperty|undefined} */
    let classOfNodeProperty = undefined;
    const classOfViewModelProperty = ViewModelProperty;

    do {
      const isComment = node instanceof Comment;
      classOfNodeProperty = this.classOfNodePropertyByNameByIsComment[isComment][nodePropertyName];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (isComment) utils.raise(`unknown node property ${nodePropertyName}`);
      const nameElements = nodePropertyName.split(".");
      classOfNodeProperty = this.classOfNodePropertyByFirstName[nameElements[0]];
      if (typeof classOfNodeProperty !== "undefined") break;
      if (node instanceof Element) {
        if (nodePropertyName.startsWith("on")) {
          classOfNodeProperty = ElementEvent;
        } else {
          classOfNodeProperty = ElementProperty;
        }
      } else {
        classOfNodeProperty = NodeProperty;
      }
    } while(false);
    /** @type {Binding} */
    const binding = new Binding(
      component, context,
      node, nodePropertyName, classOfNodeProperty, 
      viewModel, viewModelPropertyName, classOfViewModelProperty, 
      filters);
    binding.initialize();

    return binding;
  }
}