import { IFilterText } from "../../filter/types";
import { utils } from "../../utils";
import { IBinding, INodeProperty } from "../types";
import { NodeProperty } from "./NodeProperty";

type IButton = HTMLButtonElement | HTMLInputElement;

export class PopoverTarget extends NodeProperty {
  #targetId:string = "";
  get targetId():string { 
    return this.#targetId; 
  }
  get target():HTMLElement {
    return document.getElementById(this.#targetId) as HTMLElement;
  }

  get button(): IButton {
    if (this.node instanceof HTMLButtonElement) {
      return this.node;
    }
    if (this.node instanceof HTMLInputElement) {
      return this.node;
    }
    utils.raise("PopoverTarget: not button element");
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof HTMLButtonElement) && !(node instanceof HTMLInputElement && node.type === "button")) {
      utils.raise("PopoverTarget: not button element");
    }
    if (!node.hasAttribute("popovertarget")) {
      utils.raise("PopoverTarget: missing popovertarget attribute");
    }
    super(binding, node, name, filters);
    this.#targetId = node.getAttribute("popovertarget") as string;
  }

  initialize() {
    super.initialize();
    this.binding.component?.popoverInfo.addBinding(this.button, this.binding);
  }

  get applicable(): boolean {
    if (this.binding.component?.popoverInfo.currentButton === this.button &&
      (this.target?.matches(":popover-open") ?? false)) {
      return true;
    }
    return false;
  }

}