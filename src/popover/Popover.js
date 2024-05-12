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
    const buttons = Array.from(bindingManager.fragment.querySelectorAll("[popovertarget]"));
    if (buttons.length === 0) return;
    buttons.forEach(button => {
      const id = button.getAttribute("popovertarget");
      let setContextIndexes = setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
      if (typeof setContextIndexes === "undefined") {
        setContextIndexes = () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
        setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ??
          setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
      }
      button.removeEventListener("click", setContextIndexes);
      button.addEventListener("click", setContextIndexes);
    });

  }
  static dispose(bindingManager) {
    setContextIndexesByIdByBindingManager.delete(bindingManager);
  }
}