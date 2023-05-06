import "../types.js";
import  { utils } from "../utils.js";
import {inputFilters, outputFilters} from "./Builtin.js";

// "property:vmProperty|toFix,2|toLocaleString;"
// => toFix,2|toLocaleString

export class Filter {
  /**
   * @type {string}
   */
  name;
  /**
   * @type {string[]}
   */
  options;

  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForInput(value, filters) {
    return filters.reduceRight((v, f) => (f.name in inputFilters) ? inputFilters[f.name](v, f.options) : v, value);
  }
  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForOutput(value, filters) {
    return filters.reduce((v, f) => (f.name in outputFilters) ? outputFilters[f.name](v, f.options) : v, value);
  }
  /**
   * 
   * @param {string} name 
   * @param {(value:any,options:string[])=>{}} outputFilter 
   * @param {(value:any,options:string[])=>{}} inputFilter 
   */
  static regist(name, outputFilter, inputFilter) {
    if (name in outputFilters) utils.raise(`regist filter error duplicate name (${name})`);
    if (name in inputFilters) utils.raise(`regist filter error duplicate name (${name})`);
    outputFilter && (outputFilters[name] = outputFilter);
    inputFilter && (inputFilters[name] = inputFilter);
  }
}
