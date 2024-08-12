import "../types_.js";
import { registerComponentModule } from "./Component.js";

/**
 * 
 * @param {string} html 
 * @returns {string}
 */
function toComment(html) {
  return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
    return `<!--{{${expr}}}-->`;
  });
}

/**
 * 
 * @param {string} html 
 * @returns {string}
 */
function fromComment(html) {
  return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
    return `{{${expr}}}`;
  });
}

/**
 * 
 * @param {string} path
 * @returns {Promise<ComponentModule>} 
 */
export async function loadSingleFileComponent(path) {
  const template = document.createElement("template");
  const response = await fetch(import.meta.resolve(path));
  template.innerHTML = toComment(await response.text());

  let scriptModule;
  const script = template.content.querySelector("script");
  if (script) {
    scriptModule = await import("data:text/javascript;charset=utf-8," + script.text);
    script.remove();
  } else {
    scriptModule = { ViewModel:class {} };
  }

  let cssModule;
  const style = template.content.querySelector("style");
  if (style) {
    cssModule = { css: style.textContent };
    style.remove();
  } else {
    cssModule = {};
  }

  const htmlModule = { html: fromComment(template.innerHTML) };

  return Object.assign({}, scriptModule, htmlModule, cssModule);
}

/**
 * 
 * @param {string} customElementName
 * @param {string} pathToSingleFileComponent 
 */
export async function registerSingleFileComponent(customElementName, pathToSingleFileComponent) {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  registerComponentModule(customElementName, componentModule);
}


/**
 * 
 * @param {Object<string,string>} pathToSingleFileComponentByCustomElementName
 */
export async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName) {
  for(const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
    registerSingleFileComponent(customElementName, pathToSingleFileComponent);
  }
}
