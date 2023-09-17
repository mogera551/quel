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
      const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
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
   * ViewModelのプロパティの値を強制的にNodeのプロパティへ反映する
   */
  forceUpdateNode() {
    const {component, node, radio, nodeProperty, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    const filteredValue = filters.length ? Filter.applyForOutput(value, filters, component.filters.out) : value;
    const checked = filteredValue === radio.value;
    if (radio.checked !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        radio.checked = checked;
      }));
    }
    this.lastViewModelFilteredValue = filteredValue;
    this.lastViewModelValue = value;
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, radio} = this;
    if (radio.checked) {
      const radioValue = Filter.applyForInput(radio.value, filters, component.filters.in);
      this.setViewModelValue(radioValue);
    }
  }
}