import { IBindingManager } from "../@types/binding";
import { utils } from "../utils";

type SetContextIndexes = () => void;

const setContextIndexesByIdByBindingManager:Map<IBindingManager,Map<string,SetContextIndexes>> = new Map;

export class Popover {

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @returns 
   */
  static initialize(bindingManager:IBindingManager) {
    let buttons = this.buttonsByFragment.get(bindingManager.fragment);
    if (typeof buttons === "undefined") {
      buttons = Array.from(bindingManager.fragment.querySelectorAll("[popovertarget]"));
      this.buttonsByFragment.set(bindingManager.fragment, buttons);
    }
    if (buttons.length === 0) return;
    for(const button of buttons) {
      const id:string = button.getAttribute("popovertarget") ?? utils.raise("popovertarget attribute not found");
      let setContextIndexes = setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
      if (typeof setContextIndexes === "undefined") {
        const setContextIndexesFn = (bindingManager:IBindingManager, id:string) => 
          () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
        setContextIndexes = setContextIndexesFn(bindingManager, id);
        setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ?? 
          setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
      }
      button.removeEventListener("click", setContextIndexes);
      button.addEventListener("click", setContextIndexes);
    }
  }

  static dispose(bindingManager:IBindingManager) {
    setContextIndexesByIdByBindingManager.delete(bindingManager);
  }

  static buttonsByFragment:Map<DocumentFragment,HTMLButtonElement[]> = new Map;
}