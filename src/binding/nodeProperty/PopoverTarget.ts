import { IComponent } from "../../component/types";
import { IFilterText } from "../../filter/types";
import { ILoopContext } from "../../loopContext/types";
import { BindPropertySymbol, CheckDuplicateSymbol } from "../../props/symbols";
import { utils } from "../../utils";
import { IBinding } from "../types";
import { ElementBase } from "./ElementBase";

type IButton = HTMLButtonElement | HTMLInputElement;

export class PopoverTarget extends ElementBase {
  #targetId:string = "";
  get propertyName():string {
    return this.nameElements[1];
  }

  get targetId():string { 
    return this.#targetId; 
  }
  get target():IComponent | null {
    const target = document.getElementById(this.#targetId) as IComponent;
    if (target != null && target?.isQuelComponent !== true) {
      utils.raise("PopoverTarget: not Quel Component");
    }
    return target;
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
    // ポップオーバーがオープンしているかどうかの判定
    // see https://blog.asial.co.jp/3940/
    const popoverOpened = this.target?.matches(":popover-open") ?? false;
    if (this.binding.component?.popoverInfo.currentButton === this.button && popoverOpened) {
      return true;
    }
    return false;
  }

  registerCurrentButton() {
    // ボタン押下時、ボタンを登録する
    this.binding.component?.popoverInfo.addBinding(this.button, this.binding);
    const popoverInfo = this.binding.component?.popoverInfo ?? utils.raise("PopoverTarget: no popoverInfo");
    popoverInfo.currentButton = this.button;

    // ボタンのバインドを設定する
    // ターゲット側でボタンのバインドを設定するのは、難しそうなので、ここで設定する
    const allBindings = Array.from(this.binding.component?.quelBindingSummary?.allBindings ?? []);
    // このボタンに関連するバインディングを取得
    const buttonBindings = 
      allBindings.filter(binding => (binding.nodeProperty instanceof PopoverTarget) && (binding.nodeProperty.node === this.node));
    const props = this.target?.quelProps ?? utils.raise("PopoverTarget: no target props");
    for(const binding of buttonBindings) {
      const popoverTarget = binding.nodeProperty as PopoverTarget;
      const popoverBinding = popoverTarget.binding;
      const statePropertyName = popoverTarget.binding.statePropertyName;
      const nodePropertyName = popoverTarget.propertyName; 
      if (!props[CheckDuplicateSymbol](statePropertyName, nodePropertyName)) {
        const getLoopContext = (binding:IBinding) => ():ILoopContext | undefined => {
          // ポップオーバー情報を取得し、現在のボタンを取得する
          const component:Pick<IComponent,"popoverInfo"> = binding.component ?? utils.raise("PopoverTarget: no component");
          const button = component.popoverInfo?.currentButton ?? utils.raise("PopoverTarget: no currentButton");
          // 現在のボタンに関連するポップオーバー情報を取得する
          const popoverButton = component.popoverInfo?.get(button);
          // ポップオーバー情報が存在する場合、ループコンテキストを返す
          return popoverButton?.loopContext;
        }
        props[BindPropertySymbol](statePropertyName, nodePropertyName, getLoopContext(popoverBinding));
      }
    }


  }

}