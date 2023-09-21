import "../types.js";
import { Factory } from "../bindInfo/Factory.js";
import { Parser } from "./Parser.js";

export class BindToDom {
  /**
   * data-bind属性値からバインド情報を生成
   * @param {Node} node 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @param {ContextInfo} context
   * @param {string} text data-bind属性値
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