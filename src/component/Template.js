import "../types.js";
import { utils } from "../utils.js";
import { Templates } from "../view/Templates.js";

const DATASET_BIND_PROPERTY = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

export class Template {
  /**
   * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
   * @param {string|undefined} html 
   * @param {string|undefined} css
   * @param {string} componentUuid
   * @param {string[]} customComponentNames
   * @returns {HTMLTemplateElement}
   */
  static create(html, css, componentUuid, customComponentNames) {
    const template = document.createElement("template");
    template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? this.replaceTag(html, componentUuid, customComponentNames) : "");
    return template;
  }

  /**
   * HTMLの変換
   * {{loop:}}{{if:}}{{else:}}を<template>へ置換
   * {{end:}}を</template>へ置換
   * {{...}}を<!--@@:...-->へ置換
   * <template>を<!--@@|...-->へ置換
   * @param {string} html 
   * @param {string} componentUuid
   * @param {string[]} customComponentNames
   * @returns {string}
   */
  static replaceTag(html, componentUuid, customComponentNames) {
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
    const root = document.createElement("template"); // 仮のルート
    root.innerHTML = replacedHtml;
    // カスタムコンポーネントの名前を変更する
    const customComponentKebabNames = customComponentNames.map(customComponentName => utils.toKebabCase(customComponentName));
    const changeCustomElementName = (element) => {
      for(const customComponentKebabName of customComponentKebabNames) {
        const replaceElements = Array.from(element.querySelectorAll(customComponentKebabName));
        for(const oldElement of replaceElements) {
          const newElement = document.createElement(`${customComponentKebabName}-${componentUuid}`);
          oldElement.parentElement.replaceChild(newElement, oldElement);
          if (oldElement.hasAttributes) {
            for(const attr of oldElement.attributes) {
              newElement.setAttribute(attr.name, attr.value);
            }
            newElement.setAttribute("data-orig-tag-name", customComponentKebabName);
          }
        }
      }
      const templates = Array.from(element.querySelectorAll("template"));
      for(const template of templates) {
        changeCustomElementName(template.content);
      }
    };
    if (customComponentKebabNames.length > 0) {
      changeCustomElementName(root.content);
    }

    // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
    /** @type {(element:HTMLElement)=>{}} */
    const replaceTemplate = (element) => {
      /** @type {HTMLTemplateElement} */
      let template;
      while(template = element.querySelector("template")) {
        const uuid =  utils.createUUID();
        const comment = document.createComment(`@@|${uuid}`);
        template.parentNode.replaceChild(comment, template);
        if (template.constructor !== HTMLTemplateElement) {
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

}