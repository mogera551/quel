import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo from "../bindInfo/BindInfo.js";
import Template, { TemplateChild } from "../bindInfo/Template.js";
import utils from "../utils.js";
import Binder from "./Binder.js";
import Parser from "./Parser.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET } from "../viewModel/Symbols.js";
import Factory from "../bindInfo/Factory.js";
import Component from "../component/Component.js";

const DATASET_BIND_PROPERTY = "bind";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLTemplateElement}
 */
const toHTMLTemplateElement = node => (node instanceof HTMLTemplateElement) ? node : utils.raise("not HTMLTemplateElement");

/**
 * @param {BindInfo} bind 
 * @returns {Template}
 */
const toTemplate = bind => (bind instanceof Template) ? bind : undefined;

export default class extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {number[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, component, indexes) {
    const viewModel = component.viewModel;
    const template = toHTMLTemplateElement(node);
    const bindText = template.dataset[DATASET_BIND_PROPERTY];
    const binds = Parser
      .parse(bindText, "")
      .map(info => { 
        const bind = Factory.create(Object.assign(info, {node, component, viewModel, indexes:indexes.slice()}));
        return bind;
      });
    if (binds.length === 0) return [];
    const templateBind = toTemplate(binds[0]);
    if (templateBind) {
      if (templateBind.nodeProperty !== "if" && templateBind.nodeProperty !== "loop") {
        utils.raise(`unknown node property ${templateBind.nodeProperty}`);
      }
      templateBind.expand();
      templateBind.updateNode();
      return [ templateBind ];
    } else {
      utils.raise(`not template bind`);
    }
  }
}