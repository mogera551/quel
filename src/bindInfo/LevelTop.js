import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export class LevelTop extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, nodeProperty, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, nodeProperty, filters} = this;
    const value = Filter.applyForInput(node[nodeProperty], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}