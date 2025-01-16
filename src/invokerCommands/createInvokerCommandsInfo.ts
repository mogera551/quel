
//  ポップオーバーの情報を保管するクラス
import { IBinding } from "../binding/types";
import { getParentComponent } from "../component/CustomComponent";
import { ILoopContext } from "../loopContext/types";
import { getCommandForElement } from "./getCommandForElement";
import { IInvokerCommandsButton, IInvokerCommandsInfo } from "./types";

class InvokerCommandsButton implements IInvokerCommandsButton {
  #commandFor: string;
  #button: HTMLButtonElement;
  #bindings: Set<IBinding> = new Set();
  get commandFor(): string {
    return this.#commandFor;
  }
  get button(): HTMLButtonElement {
    return this.#button;
  }
  get bindings(): Set<IBinding> {
    return this.#bindings;
  }
  get commandForElement(): HTMLElement {
    return getCommandForElement(this.#button, this.#commandFor) as HTMLElement;
  }
  #command;
  get command(): string {
    return this.#command;
  }
  get loopContext(): ILoopContext | undefined {
    return this.#bindings.values().next().value?.parentContentBindings.loopContext;
  }
  constructor(button: HTMLButtonElement) {
    this.#button = button;
    this.#commandFor = button.getAttribute("commandfor") ?? "";
    this.#command = button.getAttribute("command") ?? "";
  }
  addBinding(binding: IBinding) {
    this.#bindings.add(binding);
  }
}

class InvokerCommandsInfo implements IInvokerCommandsInfo{
  #invokerCommandsButtonByButton: Map<HTMLButtonElement, IInvokerCommandsButton> = new Map();
  #currentButton: HTMLButtonElement | undefined;
  add(button: HTMLButtonElement): IInvokerCommandsButton {
    const invokerCommandsButton = new InvokerCommandsButton(button);
    this.#invokerCommandsButtonByButton.set(button, invokerCommandsButton);
    return invokerCommandsButton;
  }
  addBinding(button: HTMLButtonElement, binding: IBinding) {
    let invokerCommandsButton = this.#invokerCommandsButtonByButton.get(button);
    if (!invokerCommandsButton) {
      invokerCommandsButton = this.add(button);
    }
    invokerCommandsButton.addBinding(binding);
  }
  get(button: HTMLButtonElement): IInvokerCommandsButton | undefined {
    return this.#invokerCommandsButtonByButton.get(button);
  }
  get currentButton(): HTMLButtonElement | undefined {
    return this.#currentButton;
  }
  set currentButton(value: HTMLButtonElement | undefined) {
    this.#currentButton = value;
  }
}

export function createInvokerCommandsInfo(): IInvokerCommandsInfo {
  return new InvokerCommandsInfo();
}