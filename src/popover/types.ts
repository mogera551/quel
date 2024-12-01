import { IBinding } from "../binding/types";
import { ILoopContext } from "../loopContext/types";

export type IButton = HTMLButtonElement | HTMLInputElement;

export interface IPopoverButton {
  readonly targetId: string;
  readonly button: IButton;
  readonly bindings: Set<IBinding>;
  readonly target: HTMLElement;
  readonly loopContext: ILoopContext | undefined
  addBinding(binding: IBinding): void;
}

export interface IPopoverInfo {
  currentButton: IButton | undefined;
  add(button: IButton): IPopoverButton;
  addBinding(button: IButton, binding: IBinding): void;
  get(button: IButton): IPopoverButton | undefined;
}