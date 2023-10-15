import "../types.js";
import { Binder } from "../binder/Binder.js";
import { Selector } from "../binder/Selector.js";
import { Context } from "../context/Context.js";

export class ViewTemplate {
  /**
   * 
   * @param {Component} component 
   * @param {HTMLTemplateElement} template
   * @param {ContextInfo} context
   * @returns {{bindings:import("../binding/Binding.js").Binding[], content:DocumentFragment}}
   */
  static render(component, template, context) {
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    const bindings = Binder.bind(nodes, component, context);
    return { bindings, content };
  }
}

export class View {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static render(rootElement, component, template) {
    const { bindings, content } = ViewTemplate.render(component, template, Context.create());
    rootElement.appendChild(content);
    return bindings;
  }
}