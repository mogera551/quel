import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo, {TemplateChild} from "./BindInfo.js";
import utils from "../utils.js";
import Binder from "./Binder.js";
import myname from "../myname.js";
import Parser from "./Parser.js";
import Filter from "../filter/Filter.js";

const DATASET_BIND_PROPERTY = "bind";
const SYM_DIRECT_GET = Symbol.for(`${myname}:viewModel.directGet`);

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
   * @param {ViewModel} viewModel
   * @param {string[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, viewModel, indexes) {
    const template = toHTMLTemplateElement(node);
    const bindText = template.dataset[DATASET_BIND_PROPERTY];
    const binds = Parser
      .parse(bindText, "")
      .map(info => Object.assign(new BindInfo, info, {node, viewModel, indexes}));
    if (binds.length === 0) return [];
    const bind = binds[0];
    if (bind.nodeProperty !== "if" && bind.nodeProperty !== "loop") {
      utils.raise(`unknown node property ${bind.nodeProperty}`);
    }
    bind.templateChildren = this.expandLoop(bind);
    bind.appendToParent();
    return [ bind ];
  }

  /**
   * 
   * @param {BindInfo} bind 
   * @returns {TemplateChild[]}
   */
  static expandLoop(bind) {
    const { nodeProperty, viewModel, viewModelProperty, filters, indexes, template } = bind;
    const children = [];

    const viewModelValue = Filter.applyForOutput(viewModel[SYM_DIRECT_GET](viewModelProperty, indexes), filters);
    if (nodeProperty === "if") {
      if (viewModelValue) {
        const rootElement = document.importNode(template.content, true);
        const binds = Binder.bind(template, rootElement, viewModel, indexes);
        const childNodes = Array.from(rootElement.childNodes);
        children.push(Object.assign(new TemplateChild, { binds, childNodes }));
      }
    } else if (nodeProperty === "loop") {
      Object.keys(viewModelValue).forEach(index => {
        const newIndexes = indexes.concat(index);
        const rootElement = document.importNode(template.content, true);
        const binds = Binder.bind(template, rootElement, viewModel, newIndexes);
        const childNodes = Array.from(rootElement.childNodes);
        children.push(Object.assign(new TemplateChild, { binds, childNodes }));
      });
    }

    return children;
  }

}