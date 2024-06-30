/**
 * @type {Map<BindingManager,Map<string,number[]>>}
 */
const setContextIndexesByIdByBindingManager = new Map;

export class Popover {

  /**
   * 
   * @param {BindingManager} bindingManager 
   * @returns 
   */
  static initialize(bindingManager) {
    let buttons = this.buttonsByFragment.get(bindingManager.fragment);
    if (typeof buttons === "undefined") {
      buttons = Array.from(bindingManager.fragment.querySelectorAll("[popovertarget]"));
      this.buttonsByFragment.set(bindingManager.fragment, buttons);
    }
    if (buttons.length === 0) return;
    for(const button of buttons) {
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

  /**
   * 
   * @param {BindingManager} bindingManager 
   */
  static dispose(bindingManager) {
    setContextIndexesByIdByBindingManager.delete(bindingManager);
  }

  /** @type {Map<DocumentFragment,HTMLButtonElement[]>} */
  static buttonsByFragment = new Map;
}