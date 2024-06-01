import "../types.js";
import  { utils } from "../utils.js";
import {inputFilters, outputFilters, eventFilters} from "./Builtin.js";

// "property:vmProperty|toFix,2|toLocaleString;"
// => toFix,2|toLocaleString

const THRU_FUNC = (v) => v;

export class Filter {
  /** @type {string} */
  name;
  /** @type {string[]} */
  options;
  /** @type {FilterFunc} */
  inputFilterFunc;
  /** @type {FilterFunc} */
  outputFilterFunc;
  /** @type {EventFilterFunc} */
  eventFilterFunc;

  /**
   * 
   * @param {string} name 
   * @param {string[]} options 
   * @param {FilterFuncWithOption} inputFilterFunc 
   * @param {FilterFuncWithOption} outputFilterFunc 
   * @param {EventFilterFuncWithOption} eventFilterFunc 
   */
  constructor(name, options, inputFilterFunc, outputFilterFunc, eventFilterFunc) {
    this.name = name;
    this.options = options;
    this.inputFilterFunc = inputFilterFunc(options) ?? THRU_FUNC;
    this.outputFilterFunc = outputFilterFunc(options) ?? THRU_FUNC;
    this.eventFilterFunc = eventFilterFunc(options) ?? THRU_FUNC;
  }

  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForInput(value, filters) {
    return filters.reduceRight((v, f) => f.inputFilterFunc(v), value);
  }
  
  /**
   * 
   * @param {any} value 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForOutput(value, filters) {
    return filters.reduce((v, f) => f.outputFilterFunc(v), value);
  }

  /**
   * 
   * @param {Event} event 
   * @param {Filter[]} filters 
   * @returns {any}
   */
  static applyForEvent(event, filters) {
    return filters.reduce((e, f) => f.eventFilterFunc(e), event);
  }

  /**
   * 
   * @param {Component} component 
   * @returns {(name:string,options:string[])=>Filter}
   */
  static createFilter = (component) => (name, options) => {
    const inputFilterFunc = component.filters.in[name];
    const outputFilterFunc = component.filters.out[name];
    const eventFilterFunc = component.filters.event[name];
    return new Filter(name, options, inputFilterFunc, outputFilterFunc, eventFilterFunc);
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
