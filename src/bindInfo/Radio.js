import "../types.js";
import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export class Radio extends BindInfo {
  get radio() {
    const input = toHTMLInputElement(this.element);
    return input["type"] === "radio" ? input : utils.raise('not radio');
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, radio, nodeProperty, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = Filter.applyForOutput(value, filters, component.filters.out);
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
          radio.checked = filteredValue === radio.value;
        }));
        this.lastViewModelFilteredValue = filteredValue;
      }
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, radio} = this;
    if (radio.checked) {
      const radioValue = Filter.applyForInput(radio.value, filters, component.filters.in);
      this.setViewModelValue(radioValue);
      this.lastViewModelValue = radioValue;
    }
  }
}