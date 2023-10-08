import { Context } from "../context/Context.js";
import { Bindings, Binding } from "./Binding.js";

export class BlockBranch extends Binding {
  /** @type {Bindings | undefined} */
  get child() {
    return this.children[0];
  }
  set child(value) {
    if (value === null) {
      this.children.pop();
    } else {
      if (this.children.length === 0) {
        this.children.push(value);
      } else {
        this.children[0] = value;
      }
    }
  }

  get currentValue() {
    return this.children.length > 0;
  }

  /**
   * 
   */
  applyToNode() {
    const { component, nodeProperty, viewModelProperty, context, currentValue } = this;
    /** @type {import("./nodePoperty/TemplateProperty.js").TemplateProperty} */
    const templateProperty = nodeProperty;
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (currentValue !== filteredViewModelValue) {
      if (filteredViewModelValue) {
        // 生成
        this.child = new Bindings(component, templateProperty.uuid, Context.clone(context))
      } else {
        // 削除
        this.child = null;
      }
    } else {
      this.child.applyToNode();
    }
  }

}