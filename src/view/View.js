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
   * @returns {{binds:BindInfo[], content:DocumentFragment}}
   */
  static render(component, template, context) {
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    const binds = Binder.bind(nodes, component, context);
    return { binds, content };
  }
}

export class View {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {Component} component 
   * @param {HTMLTemplateElement} template 
   * @returns {BindInfo[]}
   */
  static render(rootElement, component, template) {
    const { binds, content } = ViewTemplate.render(component, template, Context.create());
    rootElement.appendChild(content);
    return binds;
  }
}