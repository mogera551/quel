import { createBinder } from "../binder/createBinder";
import { LoopContext } from "../loopContext/LoopContext";
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
    this.#parentBinding = value;
    this.#component = value?.component ?? this.#component;
    this.#loopContext = (value?.loopable === true) ? new LoopContext(this) : undefined;
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
    template: HTMLTemplateElement,
    parentBinding?: IBinding,
    component?: IComponentPartial,
  ) {
    if (typeof component === "undefined" && typeof parentBinding === "undefined") {
      utils.raise("component and parentBinding are undefined");
    }
    if (typeof component !== "undefined" && typeof parentBinding !== "undefined") {
      utils.raise("component and parentBinding are both defined");
    }
    this.#component = parentBinding?.component ?? component;
    this.parentBinding = parentBinding;
    this.template = template;
  }

  initialize() {
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
    const bindingSummary = this.component?.bindingSummary ?? utils.raise("bindingSummary is undefined");
    for(let i = 0; i < this.childBindings.length; i++) {
      bindingSummary.add(this.childBindings[i]);
    }
  }

  dispose(): void {
    // childrenBindingsの構造はそのまま保持しておく
    // 構造を保持しておくことで、再利用時に再構築する必要がなくなる
    // 構造は変化しない、変化するのは、bindingのchildrenContentBindings
    this.childBindings.forEach(binding => binding.dispose());
    this.#parentBinding = undefined;
    this.#loopContext = undefined;
    this.#component = undefined;
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
  parentBinding?: IBinding, 
  component?: IComponentPartial
): IContentBindings {
  const uuid = template.dataset["uuid"] ?? utils.raise("uuid is undefined");
  let contentBindings = _cache[uuid]?.pop();
  if (typeof contentBindings !== "undefined") {
    contentBindings.parentBinding = parentBinding;
  } else {
    contentBindings = new ContentBindings(template, parentBinding, component);
    contentBindings.initialize();
  }
  contentBindings.registerBindingsToSummary();
  return contentBindings;
}
