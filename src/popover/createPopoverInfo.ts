
//  ポップオーバーの情報を保管するクラス
import { IBinding } from "../binding/types";
import { ILoopContext } from "../loopContext/types";
import { getPopoverElement } from "./getPopoverElement";
import { IPopoverButton, IPopoverInfo } from "./types";

class PopoverButton implements IPopoverButton {
  #targetId: string;
  #button: HTMLButtonElement;
  #bindings: Set<IBinding> = new Set();
  get targetId(): string {
    return this.#targetId;
  }
  get button(): HTMLButtonElement {
    return this.#button;
  }
  get bindings(): Set<IBinding> {
    return this.#bindings;
  }
  get target(): HTMLElement {
    return getPopoverElement(this.#button, this.#targetId) as HTMLElement;
  }
  get loopContext(): ILoopContext | undefined {
    return this.#bindings.values().next().value?.parentContentBindings.loopContext;
  }
  constructor(button: HTMLButtonElement) {
    this.#button = button;
    this.#targetId = button.getAttribute("popovertarget") ?? "";
  }
  addBinding(binding: IBinding) {
    this.#bindings.add(binding);
  }
}

class PopoverInfo implements IPopoverInfo{
  #popoverButtonByButton: Map<HTMLButtonElement, IPopoverButton> = new Map();
  #currentButton: HTMLButtonElement | undefined;
  add(button: HTMLButtonElement): IPopoverButton {
    const popoverButton = new PopoverButton(button);
    this.#popoverButtonByButton.set(button, popoverButton);
    return popoverButton;
  }
  addBinding(button: HTMLButtonElement, binding: IBinding) {
    let popoverButton = this.#popoverButtonByButton.get(button);
    if (!popoverButton) {
      popoverButton = this.add(button);
    }
    popoverButton.addBinding(binding);
  }
  get(button: HTMLButtonElement): IPopoverButton | undefined {
    return this.#popoverButtonByButton.get(button);
  }
  get currentButton(): HTMLButtonElement | undefined {
    return this.#currentButton;
  }
  set currentButton(value: HTMLButtonElement | undefined) {
    this.#currentButton = value;
  }
}

export function createPopoverInfo(): IPopoverInfo {
  return new PopoverInfo();
}