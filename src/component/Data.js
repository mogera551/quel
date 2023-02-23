
export default class Data {
  /**
   * @type {string}
   */
  html;
  /**
   * @type {string}
   */
  css;
  /**
   * @type {class}
   */
  ViewModel;
  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    if (typeof this.#template === "undefined") {
      const html = this.html ? this.html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, p1) => `<!--@@${p1}-->`) : "";
      this.#template = document.createElement("template");
      this.#template.innerHTML = (this.css ? `<style>\n${this.css}\n</style>` : "") + html;
    }
    return this.#template;
  }
  set template(template) {
    this.#template = template;
  }
}
