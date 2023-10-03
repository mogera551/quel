import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class AttributeBind extends BindInfo {
  /** @type {string} 属性名 */
  get attrName() {
    return this.nodePropertyElements[1];
  }

  /** @type {string} nodeの値 */
  get nodeValue() {
    return this.element.getAttribute(this.attrName);
  }
  set nodeValue(value) {
    this.element.setAttribute(this.attrName, value);
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, attrName, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue ?? "";
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }

}