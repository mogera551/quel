import "../types.js";
import { BindInfo } from "./BindInfo.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

const STYLE_PROPERTY = "style";

export class StyleBind extends BindInfo {
  /** @type {string} */
  get styleName() {
    return this.nodePropertyElements[1];
  }

  /** @type {string} */
  get nodeValue() {
    return this.htmlElement.style[this.styleName];
  }
  set nodeValue(value) {
    this.htmlElement.style[this.styleName] = value;
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {
    const {component, node, viewModelProperty, filteredViewModelValue} = this;
    if (this.nodeValue !== filteredViewModelValue) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, STYLE_PROPERTY, viewModelProperty, filteredViewModelValue, () => {
        this.nodeValue = filteredViewModelValue;
      }));
    }
  }

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {
    this.filteredViewModelValue = this.nodeValue;
  }
}


// ToDo: ViewModelのプロパティの値とstyleの属性値が合わない場合をどうするか
// たとえば、
//   間違ったcolorをViewModelのプロパティを指定すると、styleのcolor属性には値は入らない
//   colorを#fffで、ViewModelのプロパティに指定すると、styleのcolor属性にはrgb(255,255,255)で入っている