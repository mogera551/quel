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
      const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
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
   * ViewModelのプロパティの値を強制的にNodeのプロパティへ反映する
   */
  forceUpdateNode() {
    const {component, node, element, viewModelProperty, filters} = this;
    const value = this.getViewModelValue();
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(value, filters, component.filters.out) : value;
    const joinedValue = filteredValue.join(DELIMITER);
    if (element[CLASS_PROPERTY] !== joinedValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, filteredValue, () => {
        element[CLASS_PROPERTY] = joinedValue;
      }));
    }
    this.lastViewModelFilteredValue = filteredValue;
    this.lastViewModelValue = value;
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, node, element, filters, className} = this;
    const value = Filter.applyForInput(element[CLASS_PROPERTY] ? element[CLASS_PROPERTY].split(DELIMITER) : [], filters, component.filters.in);
    this.setViewModelValue(value);
  }
}