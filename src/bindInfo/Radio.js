import BindInfo from "./BindInfo.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET } from "../viewModel/Symbols.js";
import utils from "../utils.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export default class Radio extends BindInfo {
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, contextIndexes, filters} = this;
    const radio = toHTMLInputElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, contextIndexes, indexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        radio.checked = value === radio.value;
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const radio = toHTMLInputElement(node);
    const radioValue = Filter.applyForInput(radio.value, filters);
    if (radio.checked) {
      viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, radioValue);
      this.lastViewModelValue = radioValue;
    }
  }
}