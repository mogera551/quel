import { utils } from "../utils";

const DATASET_BIND_PROPERTY = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";

const templateByUUID:{[key: string]: HTMLTemplateElement } = {};

/**
 * HTMLの変換
 * {{loop:}}{{if:}}{{else:}}を<template>へ置換
 * {{end:}}を</template>へ置換
 * {{...}}を<!--@@:...-->へ置換
 * <template>を<!--@@|...-->へ置換
 */
function replaceTag(html:string, componentUuid:string, customComponentNames:string[]):string {
  const stack:string[] = [];
  const replacedHtml:string = html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
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
  const changeCustomElementName = (element:(Element|DocumentFragment)) => {
    for(const customComponentKebabName of customComponentKebabNames) {
      const replaceElements:Element[] = Array.from(element.querySelectorAll(customComponentKebabName));
      for(const oldElement of replaceElements) {
        const newElement = document.createElement(`${customComponentKebabName}-${componentUuid}`);
        for(let i = 0; i < oldElement.attributes.length; i++) {
          const attr = oldElement.attributes[i];
          newElement.setAttribute(attr.name, attr.value);
        }
        newElement.setAttribute("data-orig-tag-name", customComponentKebabName);
        oldElement.parentNode?.replaceChild(newElement, oldElement);
      }
      const changeIsElements:Element[] = Array.from(element.querySelectorAll(`[is="${customComponentKebabName}"]`));
      for(const oldElement of changeIsElements) {
        const newElement = document.createElement(oldElement.tagName, { is:`${customComponentKebabName}-${componentUuid}` });
        for(let i = 0; i < oldElement.attributes.length; i++) {
          const attr = oldElement.attributes[i];
          if (attr.name === "is") continue;
          newElement.setAttribute(attr.name, attr.value);
        }
        newElement.setAttribute("data-orig-is", customComponentKebabName);
        oldElement.parentNode?.replaceChild(newElement, oldElement);
      }
    }
    const templates:HTMLTemplateElement[] = Array.from(element.querySelectorAll("template"));
    for(const template of templates) {
      changeCustomElementName(template.content);
    }
  };
  if (customComponentKebabNames.length > 0) {
    changeCustomElementName(root.content);
  }

  // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
  const replaceTemplate = (element:(Element|DocumentFragment)):void => {
    let template:(HTMLTemplateElement|null);
    while(template = element.querySelector("template")) {
      const uuid =  utils.createUUID();
      const comment = document.createComment(`@@|${uuid}`);
      template.parentNode?.replaceChild(comment, template);
      if (template.constructor !== HTMLTemplateElement) {
        // SVGタグ内のtemplateタグを想定
        const newTemplate = document.createElement("template");
        for(let childNode of Array.from(template.childNodes)) {
          newTemplate.content.appendChild(childNode);
        }
        const bindText = template.getAttribute(DATASET_BIND_PROPERTY);
        if (bindText) {
          newTemplate.setAttribute(DATASET_BIND_PROPERTY, bindText);
        }
        template = newTemplate;
      }
      template.setAttribute(DATASET_UUID_PROPERTY, uuid);
      replaceTemplate(template.content);
      templateByUUID[uuid] = template;
    }
  };
  replaceTemplate(root.content);

  return root.innerHTML;
}

/**
 * UUIDからHTMLTemplateElementオブジェクトを取得(ループや分岐条件のブロック)
 */
export function getByUUID(uuid:string):(HTMLTemplateElement|undefined) {
  return templateByUUID[uuid];
}

/**
 * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
 */
export function create(html:string, componentUuid:string, customComponentNames:string[]):HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = replaceTag(html, componentUuid, customComponentNames);
  template.setAttribute(DATASET_UUID_PROPERTY, componentUuid);
  templateByUUID[componentUuid] = template;
  return template;
}
