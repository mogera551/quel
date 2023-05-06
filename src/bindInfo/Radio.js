import "../types.js";
import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise();

export class Radio extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const radio = toHTMLInputElement(node);
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        radio.checked = value === radio.value;
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const radio = toHTMLInputElement(node);
    const radioValue = Filter.applyForInput(radio.value, filters);
    if (radio.checked) {
      this.setViewModelValue(radioValue);
      this.lastViewModelValue = radioValue;
    }
  }
}