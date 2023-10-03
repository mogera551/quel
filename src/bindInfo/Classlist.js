import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class ClassListBind extends BindInfo {
  /** @type {string} */
  get className() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, nodeProperty, viewModelProperty, className, filteredViewModelValue} = this;
    const hasClassName = element.classList.contains(className);
    if (filteredViewModelValue !== hasClassName) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredViewModelValue, () => {
        filteredViewModelValue ? element.classList.add(className) : element.classList.remove(className);
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.element.classList.contains(this.className);
  }
}