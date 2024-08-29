
import { IBinder, IBindNodeInfo } from "./types";
import { INewBinding, IContentBindings } from "../newBinding/types";
import { parseTemplate } from "./parseTemplate";
import { createBindings } from "./createBindings";

const UUID_DATASET = "uuid";

type BinderByUUID = {
  [key:string]: IBinder;
}

const _cache: BinderByUUID = {};

class Binder implements IBinder {
  #template: HTMLTemplateElement;
  #nodeInfos: IBindNodeInfo[];

  constructor(template: HTMLTemplateElement, useKeyed: boolean) {
    this.#template = template;
    this.#nodeInfos = parseTemplate(this.#template, useKeyed);
  }

  createBindings(content: DocumentFragment, contentBindings: IContentBindings): INewBinding[] {
    return createBindings(content, contentBindings, this.#nodeInfos);
  }
}

export function createBinder(template: HTMLTemplateElement, useKeyed: boolean): IBinder {
  const uuid = template.dataset[UUID_DATASET] ?? "";
  return _cache[uuid] ?? (_cache[uuid] = new Binder(template, useKeyed));
}


