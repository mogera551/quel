import { BindingManager } from "./Binding.js";

export class ReuseBindingManager {
  /** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
  static #bindingManagersByTemplate = new Map;

  /**
   * 
   * @param {import("./Binding.js").BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    if (bindingManager.component.useKeyed) {
      bindingManager.nodes.forEach(node => node.parentNode.removeChild(node));
    } else {
      bindingManager.removeFromParent();
    }
    bindingManager.bindings.forEach(binding => {
      bindingManager.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => this.dispose(bindingManager));
    });
    if (!bindingManager.component.useKeyed) {
      this.#bindingManagersByTemplate.get(bindingManager.template)?.push(bindingManager) ??
        this.#bindingManagersByTemplate.set(bindingManager.template, [bindingManager]);
    }
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   * @returns {BindingManager}
   */
  static create(component, template, context) {
    let bindingManager = !component.useKeyed && this.#bindingManagersByTemplate.get(template)?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, context);
    } else {
      bindingManager.setContext(component, context);
      bindingManager.bindings.forEach(binding => component.bindingSummary.add(binding));
    }
    return bindingManager;
  }

}