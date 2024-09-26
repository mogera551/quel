import { generateComponentClass } from "./generateComponentClass";
import { ImportMeta_ } from "../@types/importMeta";
import { ComponentModule } from "./types";
import { registerComponentModule } from "./registerComponentModule";

function importMetaResolve(importMeta:ImportMeta_, path:string):string {
  return importMeta.resolve(path);
}

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

export async function loadSingleFileComponent(path: string): Promise<ComponentModule> {
  const template = document.createElement("template");
  const response = await fetch(importMetaResolve(import.meta as ImportMeta_, path));
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