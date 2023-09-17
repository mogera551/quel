import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class AttributeBind extends BindInfo {
  /**
   * @type {string}
   */
  get attrName() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, attrName, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, filteredValue, () => {
          element.setAttribute(attrName, filteredValue ?? "");
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
    const {component, node, element, attrName, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
    if (element.getAttribute(attrName) !== (filteredValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, filteredValue, () => {
        element.setAttribute(attrName, filteredValue ?? "");
      }));
    }
    this.lastViewModelFilteredValue = filteredValue;
    this.lastViewModelValue = value;
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, element, attrName, filters} = this;
    const value = Filter.applyForInput(element.getAttribute(attrName), filters, component.filters.in);
    this.setViewModelValue(value);
  }

}