import { eventListenerForClickButton } from "./eventListenerForClickButton";

export function setupInvokeCommands(rootElement: Element | DocumentFragment): void {
  const buttons = rootElement.querySelectorAll("button[command]");
  buttons.forEach((button) => {
    button.addEventListener("click", eventListenerForClickButton as EventListener);
  });
}

