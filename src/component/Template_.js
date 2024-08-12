import "../types_.js";
import { utils } from "../utils.js";

const DATASET_BIND_PROPERTY = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

/** @type {Map<string,HTMLTemplateElement>} */
const templateByUUID = new Map;

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
function replaceTag(html, componentUuid, customComponentNames) {
  /** @type {string[]} */
  const stack = [];
  /** @type {string} */
  const replacedHtml =  html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
    expr = expr.trim();
    if (expr.startsWith("loop:") || expr.startsWith("if:")) {
      stack.push(expr);
      return `<template data-bind="${expr}">`;
    } else if (expr.startsWith("else:")){
      const saveExpr = stack.at(-1);
      if (typeof saveExpr === "undefined" || !saveExpr.startsWith("if:")) {
        utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
      }
      return `</template><template data-bind="${saveExpr}|not">`;
    } else if (expr.startsWith("end:")){
      if (typeof stack.pop() === "undefined") {
        utils.raise(`Template: end: is not matched with loop: or if:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else if (expr.startsWith("endif:")){
      const expr = stack.pop();
      if (typeof expr === "undefined" || !expr.startsWith("if:")) {
        utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else if (expr.startsWith("endloop:")){
      const expr = stack.pop();
      if (typeof expr === "undefined" || !expr.startsWith("loop:")) {
        utils.raise(`Template: endloop: is not matched with loop:, but {{ ${expr} }} `);
      }
      return `</template>`;
    } else {
      return `<!--@@:${expr}-->`;
    }
  });
  if (stack.length > 0) {
    utils.raise(`Template: loop: or if: is not matched with endloop: or endif:, but {{ ${stack.at(-1)} }} `);
  }
  const root = document.createElement("template"); // 仮のルート
  root.innerHTML = replacedHtml;
  // カスタムコンポーネントの名前を変更する
  const customComponentKebabNames = customComponentNames.map(customComponentName => utils.toKebabCase(customComponentName));
  const changeCustomElementName = (element) => {
    for(const customComponentKebabName of customComponentKebabNames) {
      /** @type {Element[]} */
      const replaceElements = Array.from(element.querySelectorAll(customComponentKebabName));
      for(const oldElement of replaceElements) {
        const newElement = document.createElement(`${customComponentKebabName}-${componentUuid}`);
        if (oldElement.hasAttributes) {
          for(const attr of oldElement.attributes) {
            newElement.setAttribute(attr.name, attr.value);
          }
          newElement.setAttribute("data-orig-tag-name", customComponentKebabName);
        }
        oldElement.parentNode.replaceChild(newElement, oldElement);
      }
      /** @type {Element[]} */
      const changeIsElements = Array.from(element.querySelectorAll(`[is="${customComponentKebabName}"]`));
      for(const oldElement of changeIsElements) {
        const newElement = document.createElement(oldElement.tagName, { is:`${customComponentKebabName}-${componentUuid}` });
        if (oldElement.hasAttributes) {
          for(const attr of oldElement.attributes) {
            if (attr.name === "is") continue;
            newElement.setAttribute(attr.name, attr.value);
          }
          newElement.setAttribute("data-orig-is", customComponentKebabName);
        }
        oldElement.parentNode.replaceChild(newElement, oldElement);
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
      templateByUUID.set(uuid, template);
    }
  };
  replaceTemplate(root.content);

  return root.innerHTML;
}

/**
 * UUIDからHTMLTemplateElementオブジェクトを取得(ループや分岐条件のブロック)
 * @param {string} uuid 
 * @returns {HTMLTemplateElement}
 */
export function getByUUID(uuid) {
  return templateByUUID.get(uuid);
}

/**
 * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
 * @param {string|undefined} html 
 * @param {string} componentUuid
 * @param {string[]} customComponentNames
 * @returns {HTMLTemplateElement}
 */
export function create(html, componentUuid, customComponentNames) {
  const template = document.createElement("template");
  template.innerHTML = html ? replaceTag(html, componentUuid, customComponentNames) : "";
  template.setAttribute(DATASET_UUID_PROPERTY, componentUuid);
  templateByUUID.set(componentUuid, template);
  return template;
}
