import "../types.js";
import { Dialog } from "./Dialog.js";

const PROPS_PROPERTY = "$props";
const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const OPEN_DIALOG_METHOD = "$openDialog";
const CLOSE_DIALOG_METHOD = "$closeDialog";
const COMPONENT_PROPERTY = "$component";

/**
 * @type {Set<string>}
 */
export const setOfProperties = new Set([
  PROPS_PROPERTY,
  GLOBALS_PROPERTY,
  DEPENDENT_PROPS_PROPERTY,
  OPEN_DIALOG_METHOD,
  CLOSE_DIALOG_METHOD,
  COMPONENT_PROPERTY,
]);

/**
 * @type {Object<string,({component:Component, viewModel:ViewModel})=>{}>}
 */
const getFuncByName = {
  [PROPS_PROPERTY]: ({component}) => component.props,
  [GLOBALS_PROPERTY]: ({component}) => component.globals,
  [DEPENDENT_PROPS_PROPERTY]: ({viewModel}) => viewModel[DEPENDENT_PROPS_PROPERTY],
  [OPEN_DIALOG_METHOD]: () => async (name, data = {}, attributes = {}) => Dialog.open(name, data, attributes),
  [COMPONENT_PROPERTY]: ({component}) => component,
  [CLOSE_DIALOG_METHOD]: ({component}) => (data = {}) => Dialog.close(component, data),
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