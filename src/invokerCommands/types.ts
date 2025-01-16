import { IBinding } from "../binding/types";
import { ILoopContext } from "../loopContext/types";

export interface IInvokerCommandsButton {
  readonly commandFor: string;
  readonly button: HTMLButtonElement;
  readonly bindings: Set<IBinding>;
  readonly commandForElement: HTMLElement;
  readonly loopContext: ILoopContext | undefined;
  readonly command: string
  addBinding(binding: IBinding): void;
}

export interface IInvokerCommandsInfo {
  currentButton: HTMLButtonElement | undefined;
  add(button: HTMLButtonElement): IInvokerCommandsButton;
  addBinding(button: HTMLButtonElement, binding: IBinding): void;
  get(button: HTMLButtonElement): IInvokerCommandsButton | undefined;
}