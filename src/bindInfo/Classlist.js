import "../types.js";
import { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class ClassListBind extends BindInfo {
  /**
   * @type {string}
   */
  get className() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, nodeProperty, viewModelProperty, filters, className} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters, component.filters.out);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        value ? element.classList.add(className) : element.classList.remove(className);
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, node, element, filters, className} = this;
    const value = Filter.applyForInput(element.classList.contains(className), filters, component.filters.in);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}