import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise('not HTMLInputElement');

export class Checkbox extends BindInfo {
  get checkbox() {
    const input = toHTMLInputElement(this.element);
    return input["type"] === "checkbox" ? input : utils.raise('not checkbox');
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, checkbox, nodeProperty, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
          checkbox.checked = filteredValue.find(value => value === checkbox.value);
        }));
        this.lastViewModelFilteredValue = value;
      }
      this.lastViewModelValue = value;
    }
  }

  /**
   * ViewModelのプロパティの値を強制的にNodeのプロパティへ反映する
   */
  forceUpdateNode() {
    const {component, node, checkbox, nodeProperty, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
    const checked = filteredValue.find(value => value === checkbox.value);
    if (checkbox.checked !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        checkbox.checked = checked;
      }));
    }
    this.lastViewModelFilteredValue = value;
    this.lastViewModelValue = value;
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, node, filters, checkbox} = this;
    const checkboxValue = Filter.applyForInput(checkbox.value, filters, component.filters.in);
    const setOfValue = new Set(this.getViewModelValue());
    (checkbox.checked) ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    this.setViewModelValue(value);
  }
}