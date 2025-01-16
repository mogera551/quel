
import { getParentComponent } from "../../component/CustomComponent";
import { eventListenerForCommand } from "./eventListenerForCommand";
import { ICommandEvent } from "./types";

function getCommandForElement(element: HTMLElement): HTMLElement | null {
  const commandFor = element.getAttribute("commandfor"); // ToDo: commandForElement
  if (commandFor == null) {
    return null;
  }
  if (commandFor === ":host") {
    return getParentComponent(element) as HTMLElement;
  }
  const component = getParentComponent(element);
  if (component != null) {
    const target = component.quelQueryRoot.querySelector("#" + commandFor);
    if (target != null) {
      return target as HTMLElement;
    }
  }
  const target = document.getElementById(commandFor);
  if (target == null) {
    return null;
  }
  return target;
}

export function eventListenerForClickButton(event: PointerEvent): void {
  const button = event.target as HTMLButtonElement;
  if (button == null) {
    return;
  }
  const cmd = button.getAttribute("command");
  if (cmd == null) {
    return;
  }
  const element = getCommandForElement(button);
  if (element == null) {
    return;
  }
  element.addEventListener("command", eventListenerForCommand);
  
  const detail:ICommandEvent = { command: cmd, source: button, target: element };
  element.dispatchEvent(new CustomEvent("command", { detail }));
}
