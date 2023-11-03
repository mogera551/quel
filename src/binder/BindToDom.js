import "../types.js";
import { Factory } from "../binding/Factory.js";
import { Parser } from "./Parser.js";

export class BindToDom {
  /**
   * data-bind属性のテキストからバインド情報を生成
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   * @param {Node} node 
   * @param {ViewModel} viewModel 
   * @param {string} text data-bind属性値
   * @param {string|undefined} defaultName nodeのデフォルトプロパティ名
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static parseBindText = (bindingManager, node, viewModel, text, defaultName) => {
    return Parser.parse(text, defaultName).map(info => 
      Factory.create(bindingManager, node, info.nodeProperty, viewModel, info.viewModelProperty, info.filters));
  }

} 