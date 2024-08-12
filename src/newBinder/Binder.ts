

import { IBindNodeInfo } from "../@types/binder";
import { IBinding, IBindingManager } from "../@types/binding";
import { parseTemplate } from "./parseTemplate";
import { createBindings } from "./createBindings";

const UUID_DATASET = "uuid";

type BinderByUUID = {
  [key:string]:Binder;
}

const _cache:BinderByUUID = {};

export class Binder {
  template: HTMLTemplateElement;
  uuid:string;
  nodeInfos:IBindNodeInfo[];

  constructor(template:HTMLTemplateElement, uuid:string, useKeyed:boolean) {
    this.template = template;
    this.uuid = uuid;
    this.nodeInfos = parseTemplate(this.template, useKeyed);
  }

  createBindings(content:DocumentFragment, bindingManager:IBindingManager):IBinding[] {
    return createBindings(content, bindingManager, this.nodeInfos);
  }

  static create(template:HTMLTemplateElement, useKeyed:boolean):Binder {
    const uuid = template.dataset[UUID_DATASET] ?? "";
    return _cache[uuid] ?? (_cache[uuid] = new Binder(template, uuid, useKeyed));
  }
}


