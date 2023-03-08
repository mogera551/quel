import Component from "../component/Component.js";
import utils from "../utils.js";

const PREFIX_EVENT = "on";

/**
 * @enum {number}
 */
export const NodePropertyType = {
  levelTop: 1,
  level2nd: 2,
  level3rd: 3,
  className: 10,
  radio: 20,
  checkbox: 30,
  template: 90,
  event: 91,
  component: 92,
};

export default class {
  /**
   * 
   * @param {Node} node
   * @param {string} nodeProperty 
   * @returns {{type:NodePropertyType,nodePropertyElements:string[],eventType:string}}
   */
  static getInfo(node, nodeProperty) {
    const result = {type:null, nodePropertyElements:[], eventType:null};
    if (node instanceof HTMLTemplateElement) { 
      result.type = NodePropertyType.template;
      return result;
    };

    result.nodePropertyElements = nodeProperty.split(".");
    if (node instanceof Component) { 
      result.type = NodePropertyType.component;
      return result;
    };
    if (result.nodePropertyElements.length === 1) {
      if (result.nodePropertyElements[0].startsWith(PREFIX_EVENT)) {
        result.type = NodePropertyType.event;
        result.eventType = result.nodePropertyElements[0].slice(PREFIX_EVENT.length);
      } else if (result.nodePropertyElements[0] === "radio") {
        result.type = NodePropertyType.radio;
      } else if (result.nodePropertyElements[1] === "checkbox") {
        result.type = NodePropertyType.checkbox;
      } else {
        result.type = NodePropertyType.levelTop;
      }
    } else if (result.nodePropertyElements.length === 2) {
      if (result.nodePropertyElements[0] === "className") {
        result.type = NodePropertyType.className;
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

