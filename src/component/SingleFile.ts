import { ComponentModule } from "../@types/component";
import { importMetaResolve } from "./ImportMetaResolve.js";
import { registerComponentModule } from "./Component";

function toComment(html:string):string {
  return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
    return `<!--{{${expr}}}-->`;
  });
}

function fromComment(html:string):string {
  return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
    return `{{${expr}}}`;
  });
}

export async function loadSingleFileComponent(path:string):Promise<ComponentModule> {
  const template = document.createElement("template");
  const response = await fetch(importMetaResolve(import.meta, path));
  template.innerHTML = toComment(await response.text());

  let scriptModule;
  const script = template.content.querySelector("script");
  if (script) {
    scriptModule = await import("data:text/javascript;charset=utf-8," + script.text);
    script.remove();
  } else {
    scriptModule = { State:class {} };
  }

  let cssModule;
  const style = template.content.querySelector("style");
  if (style) {
    cssModule = { css: style.textContent };
    style.remove();
  } else {
    cssModule = {};
  }

  const htmlModule = { html: fromComment(template.innerHTML).trim() };

  return Object.assign({}, scriptModule, htmlModule, cssModule);
}

export async function registerSingleFileComponent(customElementName:string, pathToSingleFileComponent:string) {
  const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
  registerComponentModule(customElementName, componentModule);
}


export async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName:{[key:string]:string}) {
  for(const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
    registerSingleFileComponent(customElementName, pathToSingleFileComponent);
  }
}