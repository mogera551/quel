import "../types.js";
import Binder from "../bind/Binder.js";
import Binds from "../bind/Binds.js";

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
   * @param {ViewModel} viewModel
   * @returns {Binds}
   */
  render(viewModel) {
    const content = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    const binds = new Binds(Binder.bind(this.template, content, viewModel));
    this.rootElement.appendChild(content);
    return binds;
  }

}