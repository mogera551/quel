import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const CLASS_PROPERTY = "className";
const DELIMITER = " ";

export class ClassNameBind extends BindInfo {
  /**
   * @type {string}
   */
  get nodeValue() {
    return this.element[CLASS_PROPERTY];
  }
  set nodeValue(value) {
    this.element[CLASS_PROPERTY] = value;
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filters, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    const joinedValue = filteredValue.join(DELIMITER);
    if (this.nodeValue !== joinedValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, filteredValue, () => {
        this.nodeValue = joinedValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, nodeValue} = this;
    const value = Filter.applyForInput(nodeValue ? nodeValue.split(DELIMITER) : [], filters, component.filters.in);
    this.viewModelValue = value;
  }
}