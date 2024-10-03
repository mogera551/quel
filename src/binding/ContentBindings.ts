import { createBinder } from "../binder/createBinder";
import { CleanIndexes } from "../dotNotation/types";
import { createLoopContext } from "../loopContext/createLoopContext";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { IBinding, IContentBindings, IComponentPartial } from "./types";

class ContentBindings implements IContentBindings {
  #component?: IComponentPartial;
  template: HTMLTemplateElement;
  #childBindings?: IBinding[];
  #parentBinding?: IBinding;
  #loopContext?: ILoopContext;
  #childNodes?: Node[];
  #fragment?: DocumentFragment;
  #loopable = false;

  get component(): IComponentPartial | undefined {
    return this.#component;
  }

  get childBindings(): IBinding[] {
    if (typeof this.#childBindings === "undefined") {
      utils.raise("childBindings is undefined");
    }
    return this.#childBindings;
  }

  get parentBinding(): IBinding | undefined {
    return this.#parentBinding;
  }
  set parentBinding(value: IBinding | undefined) {
    if (typeof value !== "undefined") {
      (this.#component !== value.component) && utils.raise("component is different");
      (this.#loopable !== value.loopable) && utils.raise("loopable is different");
    }
    this.#parentBinding = value;
  }

  get loopContext(): ILoopContext | undefined {
    return this.#loopContext;
  }

  get childNodes(): Node[] {
    if (typeof this.#childNodes === "undefined") {
      utils.raise("childNodes is undefined");
    }
    return this.#childNodes;
  }

  get lastChildNode(): Node | undefined {
    return this.childNodes[this.childNodes.length - 1];
  }

  get currentLoopContext(): ILoopContext | undefined {
    if (typeof this.#loopContext === "undefined") {
      return this.parentContentBindings?.loopContext;
    } else {
      return this.#loopContext;
    }
  }

  get parentContentBindings(): IContentBindings | undefined {
    return this.parentBinding?.parentContentBindings;
  }

  get fragment(): DocumentFragment {
    if (typeof this.#fragment === "undefined") {
      utils.raise("fragment is undefined");
    }
    return this.#fragment;
  }

  get allChildBindings(): IBinding[] {
    const allChildBindings:IBinding[] = [];
    for(let i = 0; i < this.childBindings.length; i++) {
      allChildBindings.push(this.childBindings[i]);
      for(let j = 0; j < this.childBindings[i].childrenContentBindings.length; j++) {
        allChildBindings.push(...this.childBindings[i].childrenContentBindings[j].allChildBindings);
      }
    }
    return allChildBindings;
  }

  constructor(
    component: IComponentPartial,
    template: HTMLTemplateElement,
    loopable: boolean = false,
  ) {
    this.#component = component;
    this.template = template;
    this.#loopable = loopable;
    if (loopable) {
      this.#loopContext = createLoopContext(this);
    }
    const binder = createBinder(this.template, this.component?.useKeyed ?? utils.raise("useKeyed is undefined"));
    this.#fragment = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#childBindings = binder.createBindings(this.#fragment, this);
    this.#childNodes = Array.from(this.#fragment.childNodes);
  }

  removeChildNodes():void {
    this.fragment.append.apply(this.fragment, this.childNodes);
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    const newBindingSummary = this.component?.newBindingSummary ?? utils.raise("bindingSummary is undefined");
    for(let i = 0; i < this.childBindings.length; i++) {
      newBindingSummary.register(this.childBindings[i]);
    }
  }

  dispose(): void {
    // childrenBindingsの構造はそのまま保持しておく
    // 構造を保持しておくことで、再利用時に再構築する必要がなくなる
    // 構造は変化しない、変化するのは、bindingのchildrenContentBindings
    this.childBindings.forEach(binding => binding.dispose());
    this.loopContext?.dispose();
    this.#parentBinding = undefined;
    this.removeChildNodes();
    const uuid = this.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
    _cache[uuid]?.push(this) ?? (_cache[uuid] = [this]);
  }

  rebuild(): void {
    const selectValues = [];
    for(let i = 0; i < this.childBindings.length; i++) {
      const binding = this.childBindings[i];
      if (binding.nodeProperty.isSelectValue) {
        selectValues.push(binding);
      } else {
        binding.rebuild();
      }
    }
    for(let i = 0; i < selectValues.length; i++) {
      selectValues[i].rebuild();
    }
  }
}

const _cache: {[ key: string ]: IContentBindings[]} = {};

export function createContentBindings(
  template: HTMLTemplateElement, 
  parentBinding: IBinding, 
): IContentBindings {
  const uuid = template.dataset["uuid"] ?? utils.raise("uuid is undefined");
  const component = parentBinding.component ?? utils.raise("component is undefined");
  let contentBindings = _cache[uuid]?.pop();
  if (typeof contentBindings === "undefined") {
    contentBindings = new ContentBindings(component, template, parentBinding.loopable);
  }
  contentBindings.parentBinding = parentBinding;
  contentBindings.registerBindingsToSummary();
  return contentBindings;
}

export function createRootContentBindings(
  component: IComponentPartial,
  template: HTMLTemplateElement 
): IContentBindings {
  const contentBindings = new ContentBindings(component, template);
  contentBindings.registerBindingsToSummary();
  return contentBindings;
}