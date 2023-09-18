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
   * @type {any}
   */
  get nodeValue() {
    return this.node[this.propName];
  }
  set nodeValue(value) {
    this.node[this.propName] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, propName, viewModelProperty, filters, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    if (this.nodeValue !== (filteredValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, propName, viewModelProperty, filteredValue, () => {
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