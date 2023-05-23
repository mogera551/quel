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
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, attrName, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, attrName, viewModelProperty, value, () => {
        element.setAttribute(attrName, value ?? "");
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {element, attrName, filters} = this;
    const value = Filter.applyForInput(element.getAttribute(attrName), filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }

}