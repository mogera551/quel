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
    bindingManager.parentBinding = undefined;
    bindingManager.bindings.forEach(binding => {
      bindingManager.component.bindingSummary.delete(binding);
      const removeBindManagers = binding.children.splice(0);
      removeBindManagers.forEach(bindingManager => this.dispose(bindingManager));
    });
    if (true || !bindingManager.component.useKeyed) {
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
    } else {
      bindingManager.parentBinding = parentBinding;
      bindingManager.replaceLoopContext(loopInfo);
      bindingManager.bindings.forEach(binding => component.bindingSummary.add(binding));
    }
    return bindingManager;
  }

}