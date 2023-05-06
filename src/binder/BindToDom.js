import { Factory } from "../bindInfo/Factory.js";
import { Parser } from "./Parser.js";

export class BindToDom {
  /**
   * 
   * @param {Node} node
   * @param {import("../component/Component.js").Component} component
   * @param {import("../bindInfo/BindInfo.js").BindInfo?} contextBind
   * @param {string[]} contextIndexes
   * @returns {import("../bindInfo/BindInfo.js").BindInfo[]} 
   */
  static bind(node, component, contextBind, contextIndexes) { }

  /**
   * 
   * @param {Node} node 
   * @param {import("../component/Component.js").Component} component
   * @param {Object<string,any>} viewModel 
   * @param {import("../bindInfo/BindInfo.js").BindInfo?} contextBind 
   * @param {number[]} contextIndexes 
   * @returns {(text:string, defaultName:string)=> import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  static parseBindText = (node, component, viewModel, contextBind, contextIndexes) => 
    (text, defaultName) => 
      Parser.parse(text, defaultName)
        .map(info => Factory.create(Object.assign(info, {node, component, viewModel, contextBind, contextIndexes:contextIndexes.slice()})));

  /**
   * 
   * @param {import("../bindInfo/BindInfo.js").BindInfo} bind 
   * @returns {void}
   */
  static applyUpdateNode = bind => bind.updateNode();
} 