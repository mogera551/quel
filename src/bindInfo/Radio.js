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
    const {component, node, radio, nodeProperty, viewModelProperty, filteredViewModelValue} = this;
    const checked = filteredViewModelValue === radio.value;
    if (radio.checked !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredViewModelValue, () => {
        radio.checked = checked;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    if (this.radio.checked) {
      this.filteredViewModelValue = this.radio.value;
    }
  }
}