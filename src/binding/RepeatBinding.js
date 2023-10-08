import { Bindings, Binding } from "./Binding.js";

export class RepeatBinding extends Binding {
  /** @type {number} */
  get currentCount() {
    return this.children.count;
  }

  /** @type {import("./nodePoperty/TemplateProperty.js").TemplateProperty} */
  get templateProperty() {
    return this.nodeProperty;
  }

  /**
   * 
   */
  applyToNode() {
    const { component, templateProperty, viewModelProperty, context, currentCount } = this;
    /** @type {Array} */
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (currentCount < filteredViewModelValue.length) {
      this.children.forEach(child => child.applyToNode());
      for(let i = currentCount; i< filteredViewModelValue.length; i++) {
        const binding = new Bindings(component, templateProperty.uuid, Context.clone(context));

      }

    } else if (currentCount > filteredViewModelValue.length) {
      const deletedChildren = this.children.splice(filteredViewModelValue.length);
      this.children.forEach(child => child.applyToNode());

    } else {
      this.children.forEach(child => child.applyToNode());
    }

  }
}
