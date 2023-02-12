import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo, {TemplateChild} from "./BindInfo.js";
import utils from "../utils.js";
import Binder from "./Binder.js";
import myname from "../myname.js";

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
   * @param {ViewModel} viewModel
   * @param {string[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, viewModel, indexes) {
    const template = toHTMLTemplateElement(node);
    const viewModelProperty = template.dataset[DATASET_BIND_PROPERTY];
    const bind = Object.assign(new BindInfo, {viewModelProperty, node, viewModel, indexes});
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
    const { viewModel, viewModelProperty, indexes, template } = bind;
    const children = [];

    const values = viewModel[Symbol.for(`${myname}:viewModel.directGet`)](viewModelProperty, indexes);
    Object.keys(values).forEach(index => {
      const newIndexes = indexes.concat(index);
      const rootElement = document.importNode(template.content, true);
      const binds = Binder.bind(template, rootElement, viewModel, newIndexes);
      const childNodes = Array.from(rootElement.childNodes);
      children.push(Object.assign(new TemplateChild, { binds, childNodes }));
    });

    return children;
  }

}