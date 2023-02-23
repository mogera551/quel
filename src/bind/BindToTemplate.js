import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo from "../bindInfo/BindInfo.js";
import { TemplateChild } from "../bindInfo/Template.js";
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
        bind.updateNode();
        return bind;
      });
    if (binds.length === 0) return [];
    const bind = binds[0];
    if (bind.nodeProperty !== "if" && bind.nodeProperty !== "loop") {
      utils.raise(`unknown node property ${bind.nodeProperty}`);
    }
    bind.templateChildren = this.expand(bind);
    bind.appendToParent();
    return [ bind ];
  }

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {TemplateChild[]}
   */
  static expand(bind) {
    const { nodeProperty, viewModel, viewModelProperty, filters, indexes } = bind;

    const viewModelValue = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (nodeProperty === "if") {
      if (viewModelValue) {
        return [ TemplateChild.create(bind, indexes) ];
      }
    } else if (nodeProperty === "loop") {
      return viewModelValue.map((value, index) => TemplateChild.create(bind, indexes.concat(index)));
    }
    return [];
  }

}