import "../types.js";
import { Factory } from "../bindInfo/Factory.js";
import { Parser } from "./Parser.js";

export class BindToDom {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {Object<string,any>} viewModel 
   * @param {ContextInfo} context
   * @returns {(text:string, defaultName:string)=> BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, context) => 
    (text, defaultName) => 
      Parser.parse(text, defaultName)
        .map(info => Factory.create(Object.assign(info, {node, component, viewModel, context})));

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
} 