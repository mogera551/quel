import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const DEFAULT_PROPERTY = "textContent";

export class TextBind extends BindInfo {
  /** @type {string} */
  get nodeValue() {
    return this.node[DEFAULT_PROPERTY];
  }
  set nodeValue(value) {
    this.node[DEFAULT_PROPERTY] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, DEFAULT_PROPERTY, viewModelProperty, filteredViewModelValue, () => {
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