import "../types.js";
import { utils } from "../utils.js";
import { BindInfo } from "./BindInfo.js";
import { Filter } from "../filter/Filter.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const STYLE_PROPERTY = "style";

export class StyleBind extends BindInfo {
  /**
   * @type {string}
   */
  get styleName() {
    return this.nodePropertyElements[1];
  }

  /**
   * @type {string}
   */
  get nodeValue() {
    return this.htmlElement[STYLE_PROPERTY][this.styleName];
  }
  set nodeValue(value) {
    this.htmlElement[STYLE_PROPERTY][this.styleName] = value;
  }
  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filters, viewModelValue} = this;
    const filteredValue = filters.length > 0 ? Filter.applyForOutput(viewModelValue, filters, component.filters.out) : viewModelValue;
    if (this.nodeValue !== filteredValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, STYLE_PROPERTY, viewModelProperty, filteredValue, () => {
        this.nodeValue = filteredValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {component, filters, nodeValue} = this;
    const value = Filter.applyForInput(nodeValue, filters, component.filters.in);
    this.viewModelValue = value;
  }
}


// ToDo: ViewModelのプロパティの値とstyleの属性値が合わない場合をどうするか
// たとえば、
//   間違ったcolorをViewModelのプロパティを指定すると、styleのcolor属性には値は入らない
//   colorを#fffで、ViewModelのプロパティに指定すると、styleのcolor属性にはrgb(255,255,255)で入っている