import { IBinder, IBindNodeInfo } from "./types";
import { IBinding, IContentBindings } from "../binding/types";
import { extractBindNodeInfosFromTemplate } from "./extractBindNodeInfosFromTemplate";
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
    this.#nodeInfos = extractBindNodeInfosFromTemplate(this.#template, useKeyed);
  }

  createBindings(content: DocumentFragment, contentBindings: IContentBindings): IBinding[] {
    return createBindings(content, contentBindings, this.#nodeInfos);
  }
}

export function createBinder(template: HTMLTemplateElement, useKeyed: boolean): IBinder {
  const uuid = template.dataset[UUID_DATASET] ?? "";
  return _cache[uuid] ?? (_cache[uuid] = new Binder(template, useKeyed));
}


