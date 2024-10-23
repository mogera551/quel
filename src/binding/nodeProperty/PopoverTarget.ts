import { IComponent } from "../../component/types";
import { IFilterText } from "../../filter/types";
import { BindPropertySymbol, CheckDuplicateSymbol } from "../../props/symbols";
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
    this.binding.defaultEventHandler = 
      (popoverTarget => event => popoverTarget.registerCurrentButton())(this);
    const props = (this.target as IComponent as Pick<IComponent,"props">).props;
    if (!props[CheckDuplicateSymbol](this.targetId, this.name)) {
      const getLoopContext = (component:Pick<IComponent,"popoverInfo">) => () => {
        const button = component.popoverInfo?.currentButton ?? utils.raise("PopoverTarget: no currentButton");
        const popoverButton = component.popoverInfo?.get(button);
        return popoverButton?.loopContext;
      }
      const component = this.binding.component ?? utils.raise("PopoverTarget: no component");
      props[BindPropertySymbol](this.binding.statePropertyName, this.name, getLoopContext(component));
    }
  }

  get applicable(): boolean {
    if (this.binding.component?.popoverInfo.currentButton === this.button &&
      (this.target?.matches(":popover-open") ?? false)) {
      return true;
    }
    return false;
  }

  // ボタン押下時、ボタンを登録する
  registerCurrentButton() {
    const popoverInfo = this.binding.component?.popoverInfo ?? utils.raise("PopoverTarget: no popoverInfo");
    popoverInfo.currentButton = this.button;
  }

}