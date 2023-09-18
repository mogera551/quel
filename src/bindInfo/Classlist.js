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
    const {component, node, element, nodeProperty, viewModelProperty, filters, className, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    const hasClassName = element.classList.contains(className);
    if (filteredValue !== hasClassName) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        filteredValue ? element.classList.add(className) : element.classList.remove(className);
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, element, filters, className} = this;
    const value = Filter.applyForInput(element.classList.contains(className), filters, component.filters.in);
    this.viewModelValue = value;
  }
}