
import { eventListenerForCommand } from "./eventListenerForCommand";
import { ICommandEvent } from "./types";

function getParentComponent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  while (parent != null) {
    if (Reflect.has(parent, "quelIsQuelComponent") && Reflect.get(parent, "quelIsQuelComponent")) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function getCommandForElement(element: HTMLElement): HTMLElement | null {
  const commandFor = element.getAttribute("commandfor"); // ToDo: commandForElement
  if (commandFor == null) {
    return null;
  }
  if (commandFor === ":host") {
    return getParentComponent(element);
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
