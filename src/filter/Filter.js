import "../types.js";
import  { utils } from "../utils.js";
import {inputFilters, outputFilters, eventFilters} from "./Builtin.js";

// "property:vmProperty|toFix,2|toLocaleString;"
// => toFix,2|toLocaleString

export class Filter {
  /** @type {string} */
  name;

  /** @type {string[]} */
  options;

  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} inputFilterFuncs
   * @returns {any}
   */
  static applyForInput(value, filters, inputFilterFuncs) {
    return filters.reduceRight((v, f) => (f.name in inputFilterFuncs) ? inputFilterFuncs[f.name](v, f.options) : v, value);
  }
  
  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} outputFilterFuncs
   * @returns {any}
   */
  static applyForOutput(value, filters, outputFilterFuncs) {
    return filters.reduce((v, f) => (f.name in outputFilterFuncs) ? outputFilterFuncs[f.name](v, f.options) : v, value);
  }

  /**
   * 
   * @param {Event} event 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} eventFilterFuncs
   * @returns {any}
   */
  static applyForEvent(event, filters, eventFilterFuncs) {
    return filters.reduce((e, f) => (f.name in eventFilterFuncs) ? eventFilterFuncs[f.name](e, f.options) : e, event);
  }

  /**
   * 
   * @param {string} name 
   * @param {(value:any,options:string[])=>{}} outputFilter 
   * @param {(value:any,options:string[])=>{}} inputFilter 
   * @param {(event:Event,options:string[])=>{}} eventFilter
   */
  static register(name, outputFilter, inputFilter, eventFilter) {
    if (name in outputFilters) utils.raise(`register filter error duplicate name (${name})`);
    if (name in inputFilters) utils.raise(`register filter error duplicate name (${name})`);
    if (name in eventFilters) utils.raise(`register filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
    eventFilter && (eventFilters[name] = eventFilter);
  }
}
