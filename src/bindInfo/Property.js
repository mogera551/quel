import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class PropertyBind extends BindInfo {
  /**
   * @type {string}
   */
  get propName() {
    return this.nodePropertyElements[0];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, propName, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = Filter.applyForOutput(value, filters, component.filters.out);
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, propName, viewModelProperty, filteredValue, () => {
          node[propName] = filteredValue ?? "";
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
    const {component, node, propName, filters} = this;
    const value = Filter.applyForInput(node[propName], filters, component.filters.in);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}