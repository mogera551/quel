import { TemplateBind, TemplateChild } from "./Template.js";
import { Context } from "../../context/Context.js";

export class IfBind extends TemplateBind {
  /** @type {TemplateChild | undefined} */
  get templateChild() {
    return this.templateChildren[0];
  }
  set templateChild(value) {
    if (this.templateChildren.length === 0) {
      this.templateChildren.push(value);
    } else {
      this.templateChildren[0] = value;
    }
  }

  /**
   * 
   */
  updateNode() {
    const { templateChild, context, filteredViewModelValue, node } = this;
    const currentValue = typeof templateChild !== "undefined";
    if (currentValue !== filteredViewModelValue) {
      if (filteredViewModelValue) {
        const newTemplateChild = TemplateChild.create(this, Context.clone(context));
        TemplateBind.appendToParent(node, [newTemplateChild]);
        this.templateChild = newTemplateChild;
      } else {
        TemplateBind.removeFromParent([templateChild]);
        this.templateChild = undefined;
      }
    } else {
      templateChild.updateNode();
    }
  }

  /**
   * 
   */
  removeFromParent() {
    if (typeof this.templateChild !== "undefined") {
      TemplateBind.removeFromParent([this.templateChild]);
      this.templateChild = undefined;
    }
  }

}