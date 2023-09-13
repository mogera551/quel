import "../types.js";
import { utils } from "../utils.js";
import { Templates } from "../view/Templates.js";

const DATASET_BIND_PROPERTY = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

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
   * @type {Object<string,FilterFunc>}
   */
  inputFilters;
  /**
   * @type {Object<string,FilterFunc>}
   */
  outputFilters;
  /**
   * @type {Object<string,Module>}
   */
  componentModules;

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
   * {{...}}を<!--@@:...-->へ置換
   * @param {string} html 
   * @returns {string}
   */
  static replaceTag(html) {
    const stack = [];
    const replacedHtml =  html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
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
        return `<!--@@:${expr}-->`;
      }
    });
    // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
    const root = document.createElement("template"); // 仮のルート
    root.innerHTML = replacedHtml;
    const replaceTemplate = (element) => {
      /**
       * @type {Node}
       */
      let template;
      while(template = element.querySelector("template")) {
        const uuid =  utils.createUUID();
        const comment = document.createComment(`@@|${uuid}`);
        template.parentNode.replaceChild(comment, template);
        if (!(template instanceof HTMLTemplateElement)) {
          // SVGタグ内のtemplateタグを想定
          const newTemplate = document.createElement("template");
          for(let childNode of Array.from(template.childNodes)) {
            newTemplate.content.appendChild(childNode);
          }
          newTemplate.setAttribute(DATASET_BIND_PROPERTY, template.getAttribute(DATASET_BIND_PROPERTY));
          template = newTemplate;
        }
        template.setAttribute(DATASET_UUID_PROPERTY, uuid);
        replaceTemplate(template.content);
        Templates.templateByUUID.set(uuid, template);
      }
    };
    replaceTemplate(root.content);

    return root.innerHTML;
  }

  /**
   * @param {string?} html
   * @param {string?} css
   * @returns {HTMLTemplateElement}
   */
  static htmlToTemplate(html, css) {
    const template = document.createElement("template");
    template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? Module.replaceTag(html) : "");
    return template;
  }
}