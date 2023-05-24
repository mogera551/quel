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
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, htmlElement, styleName, viewModelProperty, filters} = this;
    const value = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, STYLE_PROPERTY, viewModelProperty, value, () => {
        htmlElement[STYLE_PROPERTY][styleName] = value;
      }));
      this.lastViewModelValue = value;
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    const {htmlElement, styleName, filters} = this;
    const value = Filter.applyForInput(htmlElement[STYLE_PROPERTY][styleName], filters);
    this.setViewModelValue(value);
    this.lastViewModelValue = value;
  }
}


// ToDo: ViewModelのプロパティの値とstyleの属性値が合わない場合をどうするか
// たとえば、
//   間違ったcolorをViewModelのプロパティを指定すると、styleのcolor属性には値は入らない
//   colorを#fffで、ViewModelのプロパティに指定すると、styleのcolor属性にはrgb(255,255,255)で入っている