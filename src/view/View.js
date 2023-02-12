import "../types.js";
import Binder from "../bind/Binder.js";
import BindInfo from "../bind/BindInfo.js";

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
   */
  render(viewModel) {
    const content = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    const binds = Binder.bind(this.template, content, viewModel);
    BindInfo.setInitialValue(binds);
    this.rootElement.appendChild(content);
  }

}