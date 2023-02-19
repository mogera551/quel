import BindInfo from "./BindInfo.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET } from "../viewModel/Symbols.js";
import Thread from "../thread/Thread.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`not HTMLElement`);

export default class ClassName extends BindInfo {
  get className() {
    return this.nodePropertyElements[1];
  }
  updateNode() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters, className} = this;
    const element = toHTMLElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      Thread.current.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        value ? element.classList.add(className) : element.classList.remove(className);
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters, className} = this;
    const element = toHTMLElement(node);
    const value = Filter.applyForInput(element.classList.contains(className), filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
  }
}