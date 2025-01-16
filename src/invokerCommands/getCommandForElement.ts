import { getParentComponent } from "../component/CustomComponent";

export function getCommandForElement(element:HTMLButtonElement, commandFor: string): HTMLElement | null {
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
