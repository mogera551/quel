import { IComponent } from "../../component/types";
import { IFilterText } from "../../filter/types";
import { getCommandForElement } from "../../invokerCommands/getCommandForElement";
import { ILoopContext } from "../../loopContext/types";
import { BindPropertySymbol, CheckDuplicateSymbol } from "../../props/symbols";
import { utils } from "../../utils";
import { IBinding } from "../types";
import { ElementBase } from "./ElementBase";

export class CommandForTarget extends ElementBase {
  #commandFor:string = "";
  get propertyName():string {
    return this.nameElements[1];
  }

  get commandFor():string { 
    return this.#commandFor; 
  }
  get commandForElement():IComponent | null {
    const commandForElement = getCommandForElement(this.node as HTMLButtonElement, this.#commandFor) as IComponent | null;
    if (commandForElement == null) {
      utils.raise("CommandForTarget: no target");
    }
    if (commandForElement != null && commandForElement?.quelIsQuelComponent !== true) {
      utils.raise("CommandForTarget: not Quel Component");
    }
    return commandForElement;
  }
  #command;
  get command(): string {
    return this.#command;
  }

  get button(): HTMLButtonElement {
    if (this.node instanceof HTMLButtonElement) {
      return this.node;
    }
    utils.raise("CommandForTarget: not button element");
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof HTMLButtonElement)) {
      utils.raise("CommandForTarget: not button element");
    }
    if (!node.hasAttribute("commandfor")) {
      utils.raise("CommandForTarget: missing commandfor attribute");
    }
    if (!node.hasAttribute("command")) {
      utils.raise("CommandForTarget: missing command attribute");
    }
    super(binding, node, name, filters);
    this.#commandFor = node.getAttribute("commandfor") as string;
    this.#command = node.getAttribute("command") as string
  }

  initialize() {
    super.initialize();
    this.binding.defaultEventHandler = 
      (commandForTarget => event => commandForTarget.registerCurrentButton())(this);
  }

  get applicable(): boolean {
    // ポップオーバーがオープンしているかどうかの判定
    // see https://blog.asial.co.jp/3940/
    const dialogOpened = this.commandForElement?.hasAttribute("open") ?? false;
    if (this.binding.component?.quelInvokerCommandsInfo.currentButton === this.button && dialogOpened) {
      return true;
    }
    return false;
  }

  registerCurrentButton() {
    // ボタン押下時、ボタンを登録する
    this.binding.component?.quelInvokerCommandsInfo.addBinding(this.button, this.binding);
    const invokerCommandsInfo = this.binding.component?.quelInvokerCommandsInfo ?? utils.raise("CommandForTarget: no invokerCommandsInfo");
    invokerCommandsInfo.currentButton = this.button;

    // ボタンのバインドを設定する
    // ターゲット側でボタンのバインドを設定するのは、難しそうなので、ここで設定する
    const allBindings = Array.from(this.binding.component?.quelBindingSummary?.allBindings ?? []);
    // このボタンに関連するバインディングを取得
    const buttonBindings = 
      allBindings.filter(binding => (binding.nodeProperty instanceof CommandForTarget) && (binding.nodeProperty.node === this.node));
    const props = this.commandForElement?.quelProps ?? utils.raise("CommandForTarget: no target props");
    for(const binding of buttonBindings) {
      const commandForTarget = binding.nodeProperty as CommandForTarget;
      const commandForBinding = commandForTarget.binding;
      const statePropertyName = commandForTarget.binding.statePropertyName;
      const nodePropertyName = commandForTarget.propertyName; 
      if (!props[CheckDuplicateSymbol](statePropertyName, nodePropertyName)) {
        const getLoopContext = (binding:IBinding) => ():ILoopContext | undefined => {
          // ポップオーバー情報を取得し、現在のボタンを取得する
          const component:Pick<IComponent,"quelInvokerCommandsInfo"> = binding.component ?? utils.raise("CommandForTarget: no component");
          const button = component.quelInvokerCommandsInfo?.currentButton ?? utils.raise("CommandForTarget: no currentButton");
          // 現在のボタンに関連するInvokerCommands情報を取得する
          const commandForButton = component.quelInvokerCommandsInfo?.get(button);
          // InvokerCommands情報が存在する場合、ループコンテキストを返す
          return commandForButton?.loopContext;
        }
        props[BindPropertySymbol](statePropertyName, nodePropertyName, getLoopContext(commandForBinding));
      }
    }
  }

}