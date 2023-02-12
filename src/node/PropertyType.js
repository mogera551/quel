import utils from "../utils.js";

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
};


export default class {
  /**
   * 
   * @param {string} nodeProperty 
   * @returns {NodePropertyType}
   */
  static get(nodeProperty) {
    const elements = nodeProperty.split(".");
    if (elements.length === 1) {
      if (elements[0] === "radio") {
        return NodePropertyType.radio;
      } else if (elements[1] === "checkbox") {
        return NodePropertyType.checkbox;
      } else {
        return NodePropertyType.levelTop;
      }
    } else if (elements.length === 2) {
      if (elements[0] === "className") {
        return NodePropertyType.className;
      } else {
        return NodePropertyType.level2nd;
      }
    } else if (elements.length === 3) {
      return NodePropertyType.level3rd;
    } else {
      utils.raise(`unknown property ${nodeProperty}`);

    }

  }
}

