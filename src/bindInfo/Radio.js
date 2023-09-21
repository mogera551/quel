import "../types.js";
import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export class Radio extends BindInfo {
  /** @type {HTMLInputElement} */
  get radio() {
    const input = toHTMLInputElement(this.element);
    return input["type"] === "radio" ? input : utils.raise('not radio');
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, radio, nodeProperty, viewModelProperty, filters, viewModelValue} = this;
    /** @type {string} */
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    const checked = filteredValue === radio.value;
    if (radio.checked !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        radio.checked = checked;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, radio} = this;
    if (radio.checked) {
      const radioValue = Filter.applyForInput(radio.value, filters, component.filters.in);
      this.viewModelValue = radioValue;
    }
  }
}