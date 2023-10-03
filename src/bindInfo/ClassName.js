import { BindInfo } from "./BindInfo.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const CLASS_PROPERTY = "className";
const DELIMITER = " ";

export class ClassNameBind extends BindInfo {
  /** @type {string} */
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
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    const joinedValue = filteredViewModelValue.join(DELIMITER);
    if (this.nodeValue !== joinedValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, CLASS_PROPERTY, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = joinedValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue ? this.nodeValue.split(DELIMITER) : [];
  }
}