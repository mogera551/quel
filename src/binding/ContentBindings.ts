import { createBinder } from "../binder/Binder";
import { LoopContext } from "../newLoopContext/LoopContext";
import { INewLoopContext } from "../newLoopContext/types";
import { utils } from "../utils";
import { INewBinding, IContentBindings, IComponentPartial } from "./types";

class ContentBindings implements IContentBindings {
  #component?: IComponentPartial;
  template: HTMLTemplateElement;
  #childrenBinding?: INewBinding[];
  #parentBinding?: INewBinding;
  #loopContext?: INewLoopContext;
  #childNodes?: Node[];
  #fragment?: DocumentFragment;

  get component(): IComponentPartial | undefined {
    return this.#component;
  }

  get childrenBinding(): INewBinding[] {
    if (typeof this.#childrenBinding === "undefined") {
      utils.raise("childrenBinding is undefined");
    }
    return this.#childrenBinding;
  }

  get parentBinding(): INewBinding | undefined {
    return this.#parentBinding;
  }
  set parentBinding(value: INewBinding | undefined) {
    this.#parentBinding = value;
    this.#loopContext = (value?.loopable === true) ? new LoopContext(this) : undefined;
    this.#component = value?.component ?? this.#component;
  }

  get loopContext(): INewLoopContext | undefined {
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

  get currentLoopContext(): INewLoopContext | undefined {
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
    parentBinding?: INewBinding,
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
  applyToNode() {
    // apply value to node exluding select tag, and apply select tag value
    const selectBindings = [];
    for(let i = 0; i < this.childrenBinding.length; i++) {
      const binding = this.childrenBinding[i];
      if (binding.nodeProperty.isSelectValue) {
        selectBindings.push(binding);
      } else {
        binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
  }

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
    for(let i = 0; i < this.childrenBinding.length; i++) {
      const bindingSummary = this.component?.bindingSummary ?? utils.raise("bindingSummary is undefined");
      bindingSummary.add(this.childrenBinding[i]);
    }
  }

  postCreate() {
    this.registerBindingsToSummary();
    this.applyToNode();
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
    cache.get(uuid)?.push(this) ?? cache.set(uuid, [this]);
  }
}

const cache = new Map<string, IContentBindings[]>;
export function createContentBindings(
  template:HTMLTemplateElement, 
  parentBinding?:INewBinding, 
  component?:IComponentPartial
):IContentBindings {
  const uuid = template.dataset["uuid"] ?? utils.raise("uuid is undefined");
  const contentBindings = cache.get(uuid)?.pop();
  if (typeof contentBindings !== "undefined") {
    contentBindings.parentBinding = parentBinding;
    return contentBindings;
  } else {
    const contentBindings = new ContentBindings(template, parentBinding, component);
    contentBindings.initialize();
    return contentBindings;
  }
}
