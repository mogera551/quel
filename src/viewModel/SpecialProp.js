import "../types.js";

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";

/**
 * @type {Set<string>}
 */
export const setOfProperties = new Set([
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  COMPONENT_PROPERTY,
]);

/**
 * @type {Object<string,({component:Component, viewModel:ViewModel})=>{}>}
 */
const getFuncByName = {
  [GLOBALS_PROPERTY]: ({component}) => component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({viewModel}) => viewModel[DEPENDENT_PROPS_PROPERTY],
  [COMPONENT_PROPERTY]: ({component}) => component,
}

export class SpecialProp {
  /**
   * 
   * @param {Component} component 
   * @param {ViewModel} viewModel 
   * @param {string} name 
   * @returns {any}
   */
  static get(component, viewModel, name) {
    return getFuncByName[name]?.({component, viewModel});
  }

  /**
   * 
   * @param {string} name 
   * @returns {boolean}
   */
  static has(name) {
    return setOfProperties.has(name);
  }
}