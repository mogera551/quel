import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const CLASS_PROPERTY = "className";
const DELIMITER = " ";

export class ClassNameBind extends BindInfo {
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, element, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, value, () => {
        element[CLASS_PROPERTY] = value.join(DELIMITER);
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {node, element, filters, className} = this;
    const value = Filter.applyForInput(element[CLASS_PROPERTY] ? element[CLASS_PROPERTY].split(DELIMITER) : [], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}