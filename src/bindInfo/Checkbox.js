import  { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const toHTMLInputElement = node => (node instanceof HTMLInputElement) ? node : utils.raise('not HTMLInputElement');

export class Checkbox extends BindInfo {
  get checkbox() {
    const input = toHTMLInputElement(this.element);
    return input["type"] === "checkbox" ? input : utils.raise('not checkbox');
  }

  /**
   * @type {boolean}
   */
  get nodeValue() {
    return this.checkbox.checked;
  }
  set nodeValue(value) {
    this.checkbox.checked = value;
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, checkbox, nodeProperty, viewModelProperty, filters, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    const checked = filteredValue.find(value => value === checkbox.value);
    if (this.nodeValue !== checked) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, filteredValue, () => {
        this.nodeValue = checked;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, nodeValue, filters, checkbox, viewModelValue} = this;
    const checkboxValue = Filter.applyForInput(checkbox.value, filters, component.filters.in);
    const setOfValue = new Set(viewModelValue);
    nodeValue ? setOfValue.add(checkboxValue) : setOfValue.delete(checkboxValue);
    const value = Array.from(setOfValue);
    this.viewModelValue = value;
  }
}