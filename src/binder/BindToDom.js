import "../types.js";
import { Factory } from "../binding/Factory.js";
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
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static parseBindText = (node, component, viewModel, context, text, defaultName) => {
    return Parser.parse(text, defaultName).map(info => 
      Factory.create(component, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters, context));
  }

} 