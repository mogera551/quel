import { Popover } from "../popover/Popover.js";
import { BindingManager } from "./Binding.js";

/** @type {Object<string,import("./Binding.js").BindingManager[]>} */
export const bindingManagersByUUID = {};

/**
 * @param {Component} component
 * @param {HTMLTemplateElement} template
 * @param {string} uuid
 * @param {Binding|undefined} parentBinding
 * @returns {BindingManager}
 */
export const createBindingManager = (component, template, uuid, parentBinding) => {
  let bindingManager = bindingManagersByUUID[uuid]?.pop()?.assign(component, template, uuid, parentBinding);
  if (typeof bindingManager === "undefined") {
    bindingManager = new BindingManager(component, template, uuid, parentBinding);
    bindingManager.initialize();
  }
  Popover.initialize(bindingManager);
  return bindingManager;
}
