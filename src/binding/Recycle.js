import { BindingManager } from "./Binding.js";

export class Recycle {
  /** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
  static bindingManagersByTemplate = new Map;

  /**
   * 
   * @param {import("./Binding.js").BindingManager} bindingManager 
   */
  static remove(bindingManager) {
    bindingManager.nodes.forEach(node => bindingManager.fragment.appendChild(node));
    bindingManager.bindings.forEach(binding => {
      bindingManager.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => this.remove(bindingManager));
    });
    const bindingManagers = this.bindingManagersByTemplate.get(bindingManager.template);
    if (typeof bindingManagers === "undefined") {
      this.bindingManagersByTemplate.set(bindingManager.template, [bindingManager]);
    } else {
      bindingManagers.push(bindingManager);
    }
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   * @returns {BindingManager}
   */
  static create(component, template, context) {
    const bindingManagers = this.bindingManagersByTemplate.get(template);
    let bindingManager;
    if (typeof bindingManagers === "undefined" || bindingManagers.length === 0) {
      bindingManager = new BindingManager(component, template, context);
    } else {
      bindingManager = bindingManagers.pop();
      bindingManager.setContext(component, context);
    }
    return bindingManager;
  }

}