import "../types.js";
import Binder from "../bind/Binder.js";
import Binds from "../bind/Binds.js";
import Component from "../component/Component.js";

export default class View {
  /**
   * @type {HTMLTemplateElement}
   */
  template;
  /**
   * @type {HTMLElement}
   */
  rootElement;

  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement 
   */
  constructor(template, rootElement) {
    this.template = template;
    this.rootElement = rootElement;
  }

  /**
   * @param {Component} component
   * @returns {Binds}
   */
  render(component) {
    const content = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    const binds = new Binds(Binder.bind(this.template, content, component));
    this.rootElement.appendChild(content);
    return binds;
  }

}