import { Factory } from "../bindInfo/Factory.js";
import { Parser } from "./Parser.js";

export class BindToDom {
  /**
   * 
   * @param {Node} node
   * @param {import("../component/Component.js").Component} component
   * @param {ContextInfo} context
   * @returns {import("../bindInfo/BindInfo.js").BindInfo[]} 
   */
  static bind(node, component, context) { }

  /**
   * 
   * @param {Node} node 
   * @param {import("../component/Component.js").Component} component
   * @param {Object<string,any>} viewModel 
   * @param {ContextInfo} context
   * @returns {(text:string, defaultName:string)=> import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, context) => 
    (text, defaultName) => 
      Parser.parse(text, defaultName)
        .map(info => Factory.create(Object.assign(info, {node, component, viewModel, context})));

  /**
   * 
   * @param {import("../bindInfo/BindInfo.js").BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
} 