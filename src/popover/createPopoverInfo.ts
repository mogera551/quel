
//  ポップオーバーの情報を保管するクラス
import { IBinding } from "../binding/types";
import { ILoopContext } from "../loopContext/types";
import { IButton, IPopoverButton, IPopoverInfo } from "./types";

class PopoverButton implements IPopoverButton {
  #targetId: string;
  #button: IButton;
  #bindings: Set<IBinding> = new Set();
  get targetId(): string {
    return this.#targetId;
  }
  get button(): IButton {
    return this.#button;
  }
  get bindings(): Set<IBinding> {
    return this.#bindings;
  }
  get target(): HTMLElement {
    return document.getElementById(this.#targetId) as HTMLElement;
  }
  get loopContext(): ILoopContext | undefined {
    return this.#bindings.values().next().value?.parentContentBindings.loopContext;
  }
  constructor(button: IButton) {
    this.#button = button;
    this.#targetId = button.getAttribute("popovertarget") ?? "";
  }
  addBinding(binding: IBinding) {
    this.#bindings.add(binding);
  }
}

class PopoverInfo implements IPopoverInfo{
  #popoverButtonByButton: Map<IButton, IPopoverButton> = new Map();
  #currentButton: IButton | undefined;
  add(button: IButton): IPopoverButton {
    const popoverButton = new PopoverButton(button);
    this.#popoverButtonByButton.set(button, popoverButton);
    return popoverButton;
  }
  addBinding(button: IButton, binding: IBinding) {
    let popoverButton = this.#popoverButtonByButton.get(button);
    if (!popoverButton) {
      popoverButton = this.add(button);
    }
    popoverButton.addBinding(binding);
  }
  get(button: IButton): IPopoverButton | undefined {
    return this.#popoverButtonByButton.get(button);
  }
  get currentButton(): IButton | undefined {
    return this.#currentButton;
  }
  set currentButton(value: IButton | undefined) {
    this.#currentButton = value;
  }
}

export function createPopoverInfo(): IPopoverInfo {
  return new PopoverInfo();
}