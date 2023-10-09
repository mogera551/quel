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
      const nodes = this.children[this.children.length - 1].nodes;
      return nodes[nodes.length - 1];
    }
  }

  /**
   * 
   */
  applyToNode() {
    const { component, templateProperty, viewModelProperty, currentCount } = this;
    /** @type {Array} */
    const filteredViewModelValue = viewModelProperty.filteredValue;
    if (currentCount < filteredViewModelValue.length) {
      this.children.forEach(child => child.applyToNode());
      const pos = viewModelProperty.context.indexes.length;
      const propName = this.viewModelProperty.propertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      for(let newIndex = currentCount; newIndex < filteredViewModelValue.length; newIndex++) {
        const newContext = Context.clone(viewModelProperty.context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos});
        const bindings = new Bindings(component, templateProperty.uuid, newContext);
        this.lastNode.appendChild(bindings.fragment);
        this.children.push(bindings);
      }

    } else if (currentCount > filteredViewModelValue.length) {
      const deletedBindings = this.children.splice(filteredViewModelValue.length);
      // ToDo:破棄
      this.children.forEach(child => child.applyToNode());
    } else {
      this.children.forEach(child => child.applyToNode());
    }

  }
}
