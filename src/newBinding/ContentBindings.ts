import { IComponent } from "../@types/component";
import { ILoopContext } from "../@types/loopContext";
import { createBinder } from "../newBinder/Binder";
import { LoopContext } from "../newLoopContext/LoopContext";
import { INewLoopContext } from "../newLoopContext/types";
import { utils } from "../utils";
import { INewBinding, IContentBindings } from "./types";

class ContentBindings implements IContentBindings {
  #component?: IComponent;
  template: HTMLTemplateElement;
  #childrenBinding?: INewBinding[];
  #parentBinding?: INewBinding;
  #loopContext?: INewLoopContext;
  #childNodes?: Node[];
  #fragment?: DocumentFragment;

  get component(): IComponent {
    if (typeof this.#component === "undefined") {
      utils.raise("component is undefined");
    }
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
    component?: IComponent,
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
    const binder = createBinder(this.template, this.component.useKeyed);
    this.#fragment = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#childrenBinding = binder.createBindings(this.#fragment, this);
    this.#childNodes = Array.from(this.#fragment.childNodes);
  }

  removeChildNodes():void {
    this.fragment.append(...this.childNodes);
  }

  applyToNode():void {
    // ToDo:再帰的に行うかどうかは要検討
//    this.childrenBinding.forEach(binding => binding.applyToNode());
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
  component?:IComponent
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
