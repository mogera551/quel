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
    const {component, node, viewModelProperty, filters, viewModelValue} = this;
    /** @type {string|null} */
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    if (this.nodeValue !== (filteredValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, DEFAULT_PROPERTY, viewModelProperty, filteredValue, () => {
        this.nodeValue = filteredValue ?? "";
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, nodeValue} = this;
    const value = Filter.applyForInput(nodeValue, filters, component.filters.in);
    this.viewModelValue = value;
  }

}