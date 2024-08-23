import { IComponent } from "../@types/component";
import { ILoopContext } from "../@types/loopContext";
import { LoopContext } from "../newLoopContext/LoopContext";
import { INewLoopContext } from "../newLoopContext/types";
import { utils } from "../utils";
import { INewBinding, IContentBindings } from "./types";

export class ContentBindings implements IContentBindings {
  #component?: IComponent;
  template: HTMLTemplateElement;
  childrenBinding: INewBinding[] = [];
  parentBinding?: INewBinding;
  #loopContext?: INewLoopContext;
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
    this.parentBinding = parentBinding;
    this.#component = component;
    this.template = template;
    if (parentBinding?.loopable === true) {
      this.#loopContext = new LoopContext(this);
    }
  }

  get loopContext(): INewLoopContext | undefined {
    return this.#loopContext;
  }

  get currentLoopContext(): INewLoopContext | undefined {
    if (typeof this.#loopContext === "undefined") {
      return this.parentBinding?.parentContentBindings?.loopContext;
    } else {
      return this.#loopContext;
    }
  }

  get component(): IComponent {
    if (typeof this.#component === "undefined") {
      return this.parentBinding?.component ?? utils.raise("component is undefined");
    }
    return this.#component;
  }

  get parentContentBindings(): IContentBindings | undefined {
    return this.parentBinding?.parentContentBindings;
  }

}