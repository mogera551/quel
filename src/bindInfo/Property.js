import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class PropertyBind extends BindInfo {
  /** @type {string} */
  get propName() {
    return this.nodePropertyElements[0];
  }

  /** @type {any} */
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
    const {component, node, propName, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== (filteredViewModelValue ?? "")) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, propName, viewModelProperty, filteredViewModelValue, () => {
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