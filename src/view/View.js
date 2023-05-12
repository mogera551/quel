import "../types.js";
import { Binder } from "../binder/Binder.js";
import { Selector } from "../binder/Selector.js";
import { Context } from "../context/Context.js";

export class View {
  /**
   * 
   * @param {HTMLElement} rootElement 
   * @param {import("../component/Component.js").Component} component 
   * @param {HTMLTemplateElement} template 
   * @returns 
   */
  static render(rootElement, component, template) {
    const content = document.importNode(template.content, true); // See http://var.blog.jp/archives/76177033.html
    const nodes = Selector.getTargetNodes(template, content);
    const binds = Binder.bind(nodes, component, Context.create());
    rootElement.appendChild(content);
    return binds;
  }
}