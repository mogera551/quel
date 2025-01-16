import { getParentComponent } from "../component/CustomComponent";

export function getPopoverElement(element:HTMLButtonElement, targetId: string): HTMLElement | null {
  if (targetId == null) {
    return null;
  }
  if (targetId === ":host") {
    return getParentComponent(element) as HTMLElement;
  }
  const component = getParentComponent(element);
  if (component != null) {
    const target = component.quelQueryRoot.querySelector("#" + targetId);
    if (target != null) {
      return target as HTMLElement;
    }
  }
  const target = document.getElementById(targetId);
  if (target == null) {
    return null;
  }
  return target;
}
