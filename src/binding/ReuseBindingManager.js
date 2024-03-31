import { BindingManager } from "./Binding.js";

export class ReuseBindingManager {
  /** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
  static #bindingManagersByTemplate = new Map;

  /**
   * 
   * @param {import("./Binding.js").BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    bindingManager.removeNodes();
    bindingManager.parentBinding = undefined;
    bindingManager.bindings.forEach(binding => {
      binding.nodeProperty.clearValue();
      bindingManager.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => bindingManager.dispose());
    });
    if (!bindingManager.component.useKeyed) {
      this.#bindingManagersByTemplate.get(bindingManager.template)?.push(bindingManager) ??
        this.#bindingManagersByTemplate.set(bindingManager.template, [bindingManager]);
    }
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @param {{name:string,index:number}|undefined} loopInfo
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding, loopInfo) {
    let bindingManager = this.#bindingManagersByTemplate.get(template)?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, parentBinding, loopInfo);
      bindingManager.initialize();
    } else {
      bindingManager.parentBinding = parentBinding;
    }
    return bindingManager;
  }

}