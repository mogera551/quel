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
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = Filter.applyForOutput(value, filters, component.filters.out);
      if (this.lastViewModelFilteredValue !== filteredValue) {
        component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, filteredValue, () => {
          element[CLASS_PROPERTY] = filteredValue.join(DELIMITER);
        }));
        this.lastViewModelFilteredValue = filteredValue;
      }
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, node, element, filters, className} = this;
    const value = Filter.applyForInput(element[CLASS_PROPERTY] ? element[CLASS_PROPERTY].split(DELIMITER) : [], filters, component.filters.in);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}