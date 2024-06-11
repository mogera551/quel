import { utils } from "../utils.js";
import { Repeat } from "../binding/nodeProperty/Repeat.js";
import { Branch } from "../binding/nodeProperty/Branch.js";
import { ViewModelProperty } from "../binding/viewModelProperty/ViewModelProperty.js";
import { ContextIndex } from "../binding/viewModelProperty/ContextIndex.js";
import { NodeProperty } from "../binding/nodeProperty/NodeProperty.js";
import { ElementClassName } from "../binding/nodeProperty/ElementClassName.js"
import { Checkbox } from "../binding/nodeProperty/Checkbox.js";
import { Radio } from "../binding/nodeProperty/Radio.js";
import { ElementEvent } from "../binding/nodeProperty/ElementEvent.js";
import { ElementClass } from "../binding/nodeProperty/ElementClass.js";
import { ElementAttribute } from "../binding/nodeProperty/ElementAttribute.js";
import { ElementStyle } from "../binding/nodeProperty/ElementStyle.js";
import { ElementProperty } from "../binding/nodeProperty/ElementProperty.js";
import { ComponentProperty } from "../binding/nodeProperty/ComponentProperty.js";
import { RepeatKeyed } from "../binding/nodeProperty/RepeatKeyed.js";

const regexp = RegExp(/^\$[0-9]+$/);

/** @type {Object<boolean,Object<string,typeof NodeProperty>>} */
const nodePropertyConstructorByNameByIsComment = {
  true: {
    "if": Branch,
  },
  false: {
    "class": ElementClassName,
    "checkbox": Checkbox,
    "radio": Radio,
  }
};

/** @type {Object<string,typeof NodeProperty>} */
const nodePropertyConstructorByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
  "props": ComponentProperty,
};

/**
 * 
 * @param {Node} node 
 * @param {string} nodePropertyName 
 * @param {string} viewModelPropertyName 
 * @param {boolean} useKeyed
 * @returns {{ nodePropertyConstructor: typeof NodeProperty, viewModelPropertyConstructor: typeof ViewModelProperty }}
 */
export const getConstructors = (node, nodePropertyName, viewModelPropertyName, useKeyed) => {
  /** @type {ViewModelProperty.constructor} */
  const viewModelPropertyConstructor = regexp.test(viewModelPropertyName) ? ContextIndex : ViewModelProperty;
  /** @type {NodeProperty.constructor} */
  let nodePropertyConstructor;
  do {
    const isComment = node instanceof Comment;
    nodePropertyConstructor = nodePropertyConstructorByNameByIsComment[isComment][nodePropertyName];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (isComment && nodePropertyName === "loop") {
      nodePropertyConstructor = useKeyed ? RepeatKeyed : Repeat;
      break;
    }
    if (isComment) utils.raise(`Factory: unknown node property ${nodePropertyName}`);
    const nameElements = nodePropertyName.split(".");
    nodePropertyConstructor = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (node instanceof Element) {
      if (nodePropertyName.startsWith("on")) {
        nodePropertyConstructor = ElementEvent;
      } else {
        nodePropertyConstructor = ElementProperty;
      }
    } else {
      nodePropertyConstructor = NodeProperty;
    }
  } while(false);
  return { nodePropertyConstructor, viewModelPropertyConstructor };
}
