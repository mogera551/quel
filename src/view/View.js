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
   */
  render() {
    const content = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.rootElement.appendChild(content);
  }

}