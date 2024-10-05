import { IBinder, IBindingNode } from "./types";
import { IBinding, IContentBindings } from "../binding/types";
import { extractBindNodeInfosFromTemplate } from "./extractBindNodeInfosFromTemplate";
import { createBindings } from "./createBindings";
import { utils } from "../utils";

const UUID_DATASET = "uuid";

type BinderByUUID = {
  [key:string]: IBinder;
}

const _cache: BinderByUUID = {};

class Binder implements IBinder {
  #template: HTMLTemplateElement;
  #nodeInfos: IBindingNode[];

  constructor(template: HTMLTemplateElement, useKeyed: boolean) {
    this.#template = template;
    this.#nodeInfos = extractBindNodeInfosFromTemplate(this.#template, useKeyed);
  }

  createBindings(content: DocumentFragment, contentBindings: IContentBindings): IBinding[] {
    return createBindings(content, contentBindings, this.#nodeInfos);
  }
}

/**
 * バインドを生成するためのクラスを生成します。
 * @param template テンプレート
 * @param useKeyed オプションのキーを使用するかどうかのフラグ 
 * @returns {IBinder}
 */
export function createBinder(
  template: HTMLTemplateElement, 
  useKeyed: boolean
): IBinder {
  const uuid = template.dataset[UUID_DATASET] ?? utils.raise("uuid not found");
  return _cache[uuid] ?? (_cache[uuid] = new Binder(template, useKeyed));
}
