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
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
          filteredValue ? element.classList.add(className) : element.classList.remove(className);
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
    const {component, node, element, nodeProperty, viewModelProperty, filters, className} = this;
    const value = this.getViewModelValue();
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
    const hasClassName = element.classList.contains(className);
    if (filteredValue !== hasClassName) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        filteredValue ? element.classList.add(className) : element.classList.remove(className);
      }));
    }
    this.lastViewModelFilteredValue = value;
    this.lastViewModelValue = value;
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, node, element, filters, className} = this;
    const value = Filter.applyForInput(element.classList.contains(className), filters, component.filters.in);
    this.setViewModelValue(value);
  }
}