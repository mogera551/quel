import { IComponent } from "../../component/types";
import { IFilterText } from "../../filter/types";
import { ILoopContext } from "../../loopContext/types";
import { BindPropertySymbol, CheckDuplicateSymbol } from "../../props/symbols";
import { utils } from "../../utils";
import { IBinding, INodeProperty } from "../types";
import { ElementBase } from "./ElementBase";
import { NodeProperty } from "./NodeProperty";

type IButton = HTMLButtonElement | HTMLInputElement;

export class PopoverTarget extends ElementBase {
  #targetId:string = "";
  get propertyName():string {
    return this.nameElements[1];
  }

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
    this.binding.defaultEventHandler = 
      (popoverTarget => event => popoverTarget.registerCurrentButton())(this);
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
    this.binding.component?.popoverInfo.addBinding(this.button, this.binding);
    const popoverInfo = this.binding.component?.popoverInfo ?? utils.raise("PopoverTarget: no popoverInfo");
    popoverInfo.currentButton = this.button;
    // ボタンのバインドを取得する
    const allBindings = Array.from(this.binding.component?.newBindingSummary?.allBindings ?? []);
    const buttonBindings = 
      allBindings.filter(binding => (binding.nodeProperty instanceof PopoverTarget) && (binding.nodeProperty.node === this.node));
    const props = (this.target as IComponent as Pick<IComponent,"props">).props;
    for(const binding of buttonBindings) {
      const popoverTarget = binding.nodeProperty as PopoverTarget;
      if (!props[CheckDuplicateSymbol](popoverTarget.binding.statePropertyName, popoverTarget.propertyName)) {
        const getLoopContext = (binding:IBinding) => ():ILoopContext | undefined => {
          const component:Pick<IComponent,"popoverInfo"> = binding.component ?? utils.raise("PopoverTarget: no component");
          const button = component.popoverInfo?.currentButton ?? utils.raise("PopoverTarget: no currentButton");
          const popoverButton = component.popoverInfo?.get(button);
          return popoverButton?.loopContext;
        }
        props[BindPropertySymbol](popoverTarget.binding.statePropertyName, popoverTarget.propertyName, getLoopContext(popoverTarget.binding));
      }
    }


  }

}