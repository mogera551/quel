import "../types.js";
import  { utils } from "../utils.js";
import { BindToTemplate } from "./BindToTemplate.js";
import { BindToElement } from "./BindToElement.js";
import { BindToText } from "./BindToText.js";

export class Binder {
  /**
   * 
   * @param {Node[]} nodes
   * @param {import("../component/Component.js").Component} component
   * @param {import("../bindInfo/BindInfo.js").BindInfo?} contextBind
   * @param {number[]} contextIndexes
   * @returns {import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  static bind(nodes, component, contextBind, contextIndexes) {
    return nodes.flatMap(node => 
      (node instanceof HTMLTemplateElement) ? BindToTemplate.bind(node, component, contextBind, contextIndexes) :
      (node instanceof HTMLElement) ? BindToElement.bind(node, component, contextBind, contextIndexes) :
      (node instanceof Comment) ? BindToText.bind(node, component, contextBind, contextIndexes) : 
      utils.raise(`unknown node type`)
    );
  }

}