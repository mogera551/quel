import { Context } from "../context/Context.js";
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

  /** @type {Node} */
  get lastNode() {
    if (this.children.length === 0) {
      return this.nodeProperty.node;
    } else {
      return this.children[this.children.length - 1].nodes[nodes.length - 1];
    }
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
      const pos = this.context.indexes.length;
      const propName = this.viewModelProperty.propertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      for(let newIndex = currentCount; newIndex < filteredViewModelValue.length; newIndex++) {
        const newContext = Context.clone(this.context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos});
        const bindings = new Bindings(component, templateProperty.uuid, newContext);
        this.lastNode.appendChild(bindings.fragment);
        this.children.push(bindings);
      }

    } else if (currentCount > filteredViewModelValue.length) {
      const deletedChildren = this.children.splice(filteredViewModelValue.length);
      this.children.forEach(child => child.applyToNode());
    } else {
      this.children.forEach(child => child.applyToNode());
    }

  }
}
