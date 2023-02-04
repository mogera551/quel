
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
      this.#template = document.createElement("template");
      this.#template.innerHTML = (this.css ? `<style>\n${this.css}\n</style>` : "") + this.html ?? "";
    }
    return this.#template;
  }
  set template(template) {
    this.#template = template;
  }
}
