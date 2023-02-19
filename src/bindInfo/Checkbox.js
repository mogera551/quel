import BindInfo from "./BindInfo.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET } from "../viewModel/Symbols.js";
import utils from "../utils.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export default class Checkbox extends BindInfo {
  updateNode() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.lastViewModelValue !== value) {
      Thread.current.addNodeUpdate(new NodeUpdateData(node, nodeProperty, () => {
        checkbox.checked = value.find(value => value === checkbox.value);
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = bind;
    const checkbox = toHTMLInputElement(node);
    const checkboxValue = Filter.applyForInput(checkbox.value, filters);
    const setOfValue = new Set(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes));
    (checkbox.checked) ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
  }
}