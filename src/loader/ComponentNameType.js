import utils from "../utils.js";

/**
 * @enum {number}
 */
export const ComponentNameType = {
  kebab: 1,
  snake: 2,
  upperCamel: 3,
  lowerCamel: 4,
};

export default class {
  /**
   * 
   * @param {string} name 
   * @returns {{
   *  [ComponentNameType.kebab]:string,
   *  [ComponentNameType.snake]:string,
   *  [ComponentNameType.upperCamel]:string,
   *  [ComponentNameType.lowerCamel]:string,
   * }}
   */
  static getNames(name) {
    const kebabName = utils.toKebabCase(name);
    const snakeName = kebabName.replaceAll("-", "_");
    const upperCamelName = kebabName.split("-").map((text, index) => {
      if (typeof text[0] !== "undefined") {
        text = text[0].toUpperCase() + text.slice(1);
      }
      return text;
    }).join("");
    const lowerCamelName = upperCamelName[0].toLowerCase() + upperCamelName.slice(1);
    return {
      [ComponentNameType.kebab]: kebabName,
      [ComponentNameType.snake]: snakeName,
      [ComponentNameType.upperCamel]: upperCamelName,
      [ComponentNameType.lowerCamel]: lowerCamelName,
    }

  }
}