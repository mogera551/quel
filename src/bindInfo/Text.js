import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const DEFAULT_PROPERTY = "textContent";

export class TextBind extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = Filter.applyForOutput(value, filters, component.filters.out);
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, DEFAULT_PROPERTY, viewModelProperty, filteredValue, () => {
          node[DEFAULT_PROPERTY] = filteredValue ?? "";
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
    const {component, node, filters} = this;
    const value = Filter.applyForInput(node[DEFAULT_PROPERTY], filters, component.filters.in);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}