import { IBinding } from "../binding/types";
import { ILoopContext } from "../loopContext/types";

export interface IPopoverButton {
  readonly targetId: string;
  readonly button: HTMLButtonElement;
  readonly bindings: Set<IBinding>;
  readonly target: HTMLElement;
  readonly loopContext: ILoopContext | undefined
  addBinding(binding: IBinding): void;
}

export interface IPopoverInfo {
  currentButton: HTMLButtonElement | undefined;
  add(button: HTMLButtonElement): IPopoverButton;
  addBinding(button: HTMLButtonElement, binding: IBinding): void;
  get(button: HTMLButtonElement): IPopoverButton | undefined;
}