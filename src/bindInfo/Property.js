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
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, propName, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, propName, viewModelProperty, value, () => {
        node[propName] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, propName, filters} = this;
    const value = Filter.applyForInput(node[propName], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}