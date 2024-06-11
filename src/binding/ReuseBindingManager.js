import { Popover } from "../popover/Popover.js";
import { BindingManager } from "./Binding.js";
import { fragmentsByUUID } from "./ReuseFragment.js";

/** @type {Map<HTMLTemplateElement,Array<import("./Binding.js").BindingManager>>} */
const bindingManagersByTemplate = new Map;

/** @type {Object<string,import("./Binding.js").BindingManager[]>} */
const bindingManagersByUUID = {};

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
    if (bindingManager.component.useKeyed) {
      // reuse fragment
      fragmentsByUUID[bindingManager.uuid]?.push(bindingManager.fragment) ??
        (fragmentsByUUID[bindingManager.uuid] = [bindingManager.fragment]);
      bindingManager.fragment = undefined;
      bindingManagersByUUID[bindingManager.uuid]?.push(bindingManager) ??
        (bindingManagersByUUID[bindingManager.uuid] = [bindingManager]);
    } else {
      // reuse bindingManager
      bindingManagersByUUID[bindingManager.uuid]?.push(bindingManager) ??
        (bindingManagersByUUID[bindingManager.uuid] = [bindingManager]);
    }
    Popover.dispose(bindingManager);
  }

  /**
   * @param {Component} component
   * @param {HTMLTemplateElement} template
   * @param {string} uuid
   * @param {Binding|undefined} parentBinding
   * @returns {BindingManager}
   */
  static create(component, template, uuid, parentBinding) {
    let bindingManager = bindingManagersByUUID[uuid]?.pop();
    if (typeof bindingManager !== "object") {
      bindingManager = new BindingManager(component, template, uuid, parentBinding);
      bindingManager.initialize();
    } else {
      bindingManager.parentBinding = parentBinding;
      bindingManager.assign(component, template, uuid, parentBinding);
      bindingManager.initialize();
    }
    Popover.initialize(bindingManager);
    return bindingManager;
  }

}