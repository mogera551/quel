import "../types.js";

export class Module {
  /**
   * @type {string}
   */
  html;
  /**
   * @type {string}
   */
  css;
  /**
   * @type {class<ViewModel>}
   */
  ViewModel;
  /**
   * @type {class<HTMLElement>}
   */
  extendClass;
  /**
   * @type {string}
   */
  extendTag;

  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Module.htmlToTemplate(this.html, this.css);
    }
    return this.#template;
  }

  /**
   * HTMLの変換
   * {{loop:}}{{if:}}{{else:}}を<template>へ置換
   * {{end:}}を</template>へ置換
   * {{...}}を<!--@@...-->へ置換
   * @param {string} html 
   * @returns {string}
   */
  static replaceTag(html) {
    const stack = [];
    return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
      expr = expr.trim();
      if (expr.startsWith("loop:") || expr.startsWith("if:")) {
        stack.push(expr);
        return `<template data-bind="${expr}">`;
      } else if (expr.startsWith("else:")){
        const saveExpr = stack.at(-1);
        return `</template><template data-bind="${saveExpr}|not">`;
      } else if (expr.startsWith("end:")){
        stack.pop();
        return `</template>`;
      } else {
        return `<!--@@${expr}-->`;
      }
    });
  }

  /**
   * @param {string?} html
   * @param {string?} css
   * @returns {HTMLTemplateElement}
   */
  static htmlToTemplate(html, css) {
    const template = document.createElement("template");
    template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ?　Module.replaceTag(html) : "");
    return template;
  }
}