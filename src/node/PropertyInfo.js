import "../types.js";
import  { utils } from "../utils.js";
import { NodePropertyType } from "./PropertyType.js";
import { TEMPLATE_BRANCH, TEMPLATE_REPEAT } from "../Const.js";
import { Symbols } from "../Symbols.js";

const PREFIX_EVENT = "on";

export class NodePropertyInfo {
  /**
   * @type {NodePropertyType}
   */
  type;
  /**
   * @type {string[]}
   */
  nodePropertyElements = [];
  /**
   * @type {string}
   */
  eventType;

  /**
   * 
   * @param {Node} node
   * @param {string} nodeProperty 
   * @returns {NodePropertyInfo}
   */
  static get(node, nodeProperty) {
    const result = new NodePropertyInfo;
    result.nodePropertyElements = nodeProperty.split(".");
    if (node instanceof Comment && node.textContent[2] === "|") {
      if (nodeProperty === TEMPLATE_BRANCH || nodeProperty === TEMPLATE_REPEAT) {
        result.type = NodePropertyType.template;
        return result;
      }
    };
    
    if (node[Symbols.isComponent] && result.nodePropertyElements[0] === "$props") { 
      result.type = NodePropertyType.component;
      return result;
    };
    if (result.nodePropertyElements.length === 1) {
      if (result.nodePropertyElements[0].startsWith(PREFIX_EVENT)) {
        result.type = NodePropertyType.event;
        result.eventType = result.nodePropertyElements[0].slice(PREFIX_EVENT.length);
      } else if (result.nodePropertyElements[0] === "radio") {
        result.type = NodePropertyType.radio;
      } else if (result.nodePropertyElements[0] === "checkbox") {
        result.type = NodePropertyType.checkbox;
      } else {
        result.type = NodePropertyType.levelTop;
      }
    } else if (result.nodePropertyElements.length === 2) {
      if (result.nodePropertyElements[0] === "class") {
        result.type = NodePropertyType.classList;
      } else if (result.nodePropertyElements[0] === "className") {
        result.type = NodePropertyType.className;
      } else if (result.nodePropertyElements[0] === "attr") {
        result.type = NodePropertyType.attribute;
      } else {
        result.type = NodePropertyType.level2nd;
      }
    } else if (result.nodePropertyElements.length === 3) {
      result.type = NodePropertyType.level3rd;
    } else {
      utils.raise(`unknown property ${nodeProperty}`);
    }
    return result;
  }
}

