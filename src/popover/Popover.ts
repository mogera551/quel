import { IContentBindings } from "../binding/types";
import { utils } from "../utils";

const setLoopIndexesByIdByContentBindings: Map<IContentBindings,Map<string,()=>void>> = new Map;

export function initializePopover(contentBindings: IContentBindings) {
  const popoverButtons = contentBindings.fragment.querySelectorAll("[popovertarget]");
  for(let i = 0; i < popoverButtons.length; i++) {
    const popoverButton = popoverButtons[i];
    const id = popoverButton.getAttribute("popovertarget") ?? utils.raise(`popovertarget is null`);
    let setLoopIndexes = setLoopIndexesByIdByContentBindings.get(contentBindings)?.get(id);
    if (typeof setLoopIndexes === "undefined") {
      setLoopIndexes = () => contentBindings.component?.popoverLoopIndexesById?.set(id, contentBindings.loopContext?.loopIndexes);
      setLoopIndexesByIdByContentBindings.get(contentBindings)?.set(id, setLoopIndexes) ?? 
        setLoopIndexesByIdByContentBindings.set(contentBindings, new Map([[id, setLoopIndexes]]));
    }
    popoverButton.removeEventListener("click", setLoopIndexes);
    popoverButton.addEventListener("click", setLoopIndexes);
  }
} 

export function disposePopover(contentBindings: IContentBindings) {
  setLoopIndexesByIdByContentBindings.delete(contentBindings);
}

/*
const setContextIndexesByIdByBindingManager = new Map;
export class Popover {

  static initialize(bindingManager) {
    const buttonList = bindingManager.fragment.querySelectorAll("[popovertarget]");
    if (buttonList.length === 0) return;
    for(const button of buttonList) {
      const id = button.getAttribute("popovertarget");
      let setContextIndexes = setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
      if (typeof setContextIndexes === "undefined") {
        setContextIndexes = () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
        setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ?? 
          setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
      }
      button.removeEventListener("click", setContextIndexes);
      button.addEventListener("click", setContextIndexes);
    }
  }
  static dispose(bindingManager) {
    setContextIndexesByIdByBindingManager.delete(bindingManager);
  }
}
*/