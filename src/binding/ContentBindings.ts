import { createBinder } from "../binder/Binder";
import { LoopContext } from "../loopContext/LoopContext";
import { ILoopContext } from "../loopContext/types";
import { utils } from "../utils";
import { IBinding, IContentBindings, IComponentPartial } from "./types";

class ContentBindings implements IContentBindings {
  #component?: IComponentPartial;
  template: HTMLTemplateElement;
  #childrenBinding?: IBinding[];
  #parentBinding?: IBinding;
  #loopContext?: ILoopContext;
  #childNodes?: Node[];
  #fragment?: DocumentFragment;

  get component(): IComponentPartial | undefined {
    return this.#component;
  }

  get childrenBinding(): IBinding[] {
    if (typeof this.#childrenBinding === "undefined") {
      utils.raise("childrenBinding is undefined");
    }
    return this.#childrenBinding;
  }

  get parentBinding(): IBinding | undefined {
    return this.#parentBinding;
  }
  set parentBinding(value: IBinding | undefined) {
    this.#parentBinding = value;
    this.#loopContext = (value?.loopable === true) ? new LoopContext(this) : undefined;
    this.#component = value?.component ?? this.#component;
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
    this.#component = parentBinding?.component ?? component ?? utils.raise("component is undefined");
    this.parentBinding = parentBinding;
    this.template = template;
  }

  initialize() {
    const binder = createBinder(this.template, this.component?.useKeyed ?? utils.raise("useKeyed is undefined"));
    this.#fragment = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#childrenBinding = binder.createBindings(this.#fragment, this);
    this.#childNodes = Array.from(this.#fragment.childNodes);
  }

  removeChildNodes():void {
    this.fragment.append(...this.childNodes);
  }

  /**
   * apply value to node
   */
//  applyToNode() {
//    // apply value to node exluding select tag, and apply select tag value
//    const selectBindings = [];
//    for(let i = 0; i < this.childrenBinding.length; i++) {
//      const binding = this.childrenBinding[i];
//      if (binding.nodeProperty.isSelectValue) {
//        selectBindings.push(binding);
//      } else {
//        binding.applyToNode();
//      }
//    }
//    for(let i = 0; i < selectBindings.length; i++) {
//      selectBindings[i].applyToNode();
//    }
//  }

  /**
   * apply value to State
   */
  applyToState() {
    for(let i = 0; i < this.childrenBinding.length; i++) {
      this.childrenBinding[i].applyToState();
    }
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    const bindingSummary = this.component?.bindingSummary ?? utils.raise("bindingSummary is undefined");
    for(let i = 0; i < this.childrenBinding.length; i++) {
      bindingSummary.add(this.childrenBinding[i]);
    }
  }

  dispose(): void {
    // childrenBindingsの構造はそのまま保持しておく
    // 構造を保持しておくことで、再利用時に再構築する必要がなくなる
    // 構造は変化しない、変化するのは、bindingのchildrenContentBindings
    this.childrenBinding.forEach(binding => binding.dispose());
    this.#parentBinding = undefined;
    this.#loopContext = undefined;
    this.#component = undefined;
    this.removeChildNodes();
    const uuid = this.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
    _cache[uuid]?.push(this) ?? (_cache[uuid] = [this]);
  }

  rebuild(): void {
    for(let i = 0; i < this.childrenBinding.length; i++) {
      this.childrenBinding[i].rebuild();
    }
  }
/*
  updateNode() {
    const selectBindings = [];
    for(let i = 0; i < this.childrenBinding.length; i++) {
      const binding = this.childrenBinding[i];
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push(binding);
      } else {
        binding.updateNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].updateNode();
    }
  }
*/
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
