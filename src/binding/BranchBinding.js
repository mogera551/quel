import { Context } from "../context/Context.js";
import { Bindings, Binding } from "./Binding.js";

export class BranchBinding extends Binding {
  /** @type {Bindings | undefined} */
  get child() {
    return this.children[0];
  }
  set child(value) {
    if (value === null) {
      const binding = this.children.pop();
      // ToDo:破棄
    } else {
      if (this.children.length === 0) {
        this.children.push(value);
      } else {
        this.children[0] = value;
      }
      this.nodeProperty.node.appendChild(value.fragment);
    }
  }

  /** @type {boolean} */
  get currentValue() {
    return this.children.length > 0;
  }

  /** @type {import("./nodePoperty/TemplateProperty.js").TemplateProperty} */
  get templateProperty() {
    return this.nodeProperty;
  }

  /**
   * 
   */
  applyToNode() {
    const { component, templateProperty, viewModelProperty, currentValue } = this;
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (currentValue !== filteredViewModelValue) {
      if (filteredViewModelValue) {
        // 生成
        this.child = new Bindings(component, templateProperty.uuid, Context.clone(viewModelProperty.context));
      } else {
        // 削除
        this.child = null;
      }
    } else {
      this.child.applyToNode();
    }
  }

}