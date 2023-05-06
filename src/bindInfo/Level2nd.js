import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class Level2nd extends BindInfo {
  get nodeProperty1() {
    return this.nodePropertyElements[0];
  }
  get nodeProperty2() {
    return this.nodePropertyElements[1];
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty1][nodeProperty2] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, filters} = this;
    const {nodeProperty1, nodeProperty2} = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}