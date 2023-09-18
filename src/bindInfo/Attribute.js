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
   * @type {string}
   */
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
    const {component, node, attrName, viewModelProperty, filters, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    if (this.nodeValue !== (filteredValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, filteredValue, () => {
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