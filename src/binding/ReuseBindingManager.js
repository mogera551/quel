import { Popover } from "../popover/Popover.js";
import { BindingManager } from "./Binding.js";

/** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
const bindingManagersByTemplate = new Map;

export class ReuseBindingManager {
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
      bindingManagersByTemplate.get(bindingManager.template)?.push(bindingManager) ??
        bindingManagersByTemplate.set(bindingManager.template, [bindingManager]);
    }
    Popover.dispose(bindingManager);
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {Binding|undefined} parentBinding
   * @returns {BindingManager}
   */
  static create(component, template, parentBinding) {
    let bindingManager = bindingManagersByTemplate.get(template)?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, parentBinding);
      bindingManager.initialize();
    } else {
      bindingManager.parentBinding = parentBinding;
    }
    Popover.initialize(bindingManager);
    return bindingManager;
  }

}