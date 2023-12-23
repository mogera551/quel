import { LoopContext } from "../loopContext/LoopContext.js";
import { BindingManager } from "./Binding.js";

export class ReuseBindingManager {
  /** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
  static #bindingManagersByTemplate = new Map;

  /**
   * 
   * @param {import("./Binding.js").BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    bindingManager.removeFromParent();
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
   * @param {LoopContext} loopContext
   * @returns {BindingManager}
   */
  static create(component, template, loopContext) {
    let bindingManager = !component.useKeyed && this.#bindingManagersByTemplate.get(template)?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, loopContext);
    } else {
      bindingManager.replaceLoopContext(loopContext);
      bindingManager.bindings.forEach(binding => component.bindingSummary.add(binding));
    }
    return bindingManager;
  }

}