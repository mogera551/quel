import "../types.js";
import { utils } from "../utils.js";
import { Binding, BindingManager } from "./Binding.js";
import { Repeat } from "./nodeProperty/Repeat.js";
import { Branch } from "./nodeProperty/Branch.js";
import { ViewModelProperty } from "./viewModelProperty/ViewModelProperty.js";
import { ContextIndex } from "./viewModelProperty/ContextIndex.js";
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
import { RepeatKeyed } from "./nodeProperty/RepeatKeyed.js";

const regexp = RegExp(/^\$[0-9]+$/);

/** 
 * @typedef {Object} ClassOf 
 * @property {NodeProperty.constructor} classOfNodeProperty
 * @property {ViewModelProperty.constructor} classOfViewModelProperty
 */

/** @type {Object<string,ClassOf>} */
const classOfByKey = {};

export class Factory {
  // 面倒くさい書き方をしているのは、循環参照でエラーになるため
  // モジュール内で、const変数で書くとjestで循環参照でエラーになる

  /** @type {Object<boolean,Object<string,NodeProperty.constructor>> | undefined} */
  static #_classOfNodePropertyByNameByIsComment;
  /** @type {Object<boolean,Object<string,NodeProperty.constructor>>} */
  static get #classOfNodePropertyByNameByIsComment() {
    if (typeof this.#_classOfNodePropertyByNameByIsComment === "undefined") {
      this.#_classOfNodePropertyByNameByIsComment = {
        true: {
          "if": Branch,
        },
        false: {
          "class": ElementClassName,
          "checkbox": Checkbox,
          "radio": Radio,
        }
      };
    }
    return this.#_classOfNodePropertyByNameByIsComment;
  }

  /** @type {ObjectObject<string,NodeProperty.constructor> | undefined} */
  static #_classOfNodePropertyByFirstName;
  /** @type {ObjectObject<string,NodeProperty.constructor>} */
  static get #classOfNodePropertyByFirstName() {
    if (typeof this.#_classOfNodePropertyByFirstName === "undefined") {
      this.#_classOfNodePropertyByFirstName = {
        "class": ElementClass,
        "attr": ElementAttribute,
        "style": ElementStyle,
        "props": ComponentProperty,
      };
    }
    return this.#_classOfNodePropertyByFirstName;
  }

  /**
   * Bindingオブジェクトを生成する
   * @param {BindingManager} bindingManager
   * @param {SelectedNode} selectedNode 
   * @param {string} nodePropertyName 
   * @param {ViewModel} viewModel 
   * @param {string} viewModelPropertyName 
   * @param {FilterInfo[]} filters 
   * @returns {Binding}
   */
  static create(bindingManager, selectedNode, nodePropertyName, viewModel, viewModelPropertyName, filters) {
    /** @type {ViewModelProperty.constructor|undefined} */
    let classOfViewModelProperty;
    /** @type {NodeProperty.constructor|undefined} */
    let classOfNodeProperty;
    /** @type {Node} */
    const node = selectedNode.node;

    /** @type {ClassOf|undefined} */
    const classOf = classOfByKey[selectedNode.key];
    if (typeof classOf !== "undefined") {
      classOfNodeProperty = classOf.classOfNodeProperty;
      classOfViewModelProperty = classOf.classOfViewModelProperty;
//      console.log("classOf", classOf);
    } else {
      classOfViewModelProperty = regexp.test(viewModelPropertyName) ? ContextIndex : ViewModelProperty;

      do {
        const isComment = node instanceof Comment;
        classOfNodeProperty = this.#classOfNodePropertyByNameByIsComment[isComment][nodePropertyName];
        if (typeof classOfNodeProperty !== "undefined") break;
        if (isComment && nodePropertyName === "loop") {
          classOfNodeProperty = bindingManager.component.useKeyed ? RepeatKeyed : Repeat;
          break;
        }
        if (isComment) utils.raise(`Factory: unknown node property ${nodePropertyName}`);
        const nameElements = nodePropertyName.split(".");
        classOfNodeProperty = this.#classOfNodePropertyByFirstName[nameElements[0]];
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
      classOfByKey[selectedNode.key] = { classOfNodeProperty, classOfViewModelProperty };
    }
    
    return Binding.create(
      bindingManager,
      node, nodePropertyName, classOfNodeProperty, 
      viewModelPropertyName, classOfViewModelProperty, 
      filters);
  }
}