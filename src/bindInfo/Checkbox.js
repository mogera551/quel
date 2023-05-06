import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export class Checkbox extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        checkbox.checked = value.find(value => value === checkbox.value);
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const checkboxValue = Filter.applyForInput(checkbox.value, filters);
    const setOfValue = new Set(this.getViewModelValue());
    (checkbox.checked) ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}