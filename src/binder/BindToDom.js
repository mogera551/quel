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
   * @param {string} text
   * @param {string} defaultName
   * @returns {BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, context, text, defaultName) => {
    const bindInfos = 
      Parser.parse(text, defaultName).map(info => Factory.create(component, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters, context));
    return bindInfos;
  }

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
} 