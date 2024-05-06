
export class Popover {

  /**
   * @type {Map<BindingManager,Map<string,number[]>>}
   */
  static setContextIndexesByIdByBindingManager = new Map;
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
      let setContextIndexes = this.setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
      if (typeof setContextIndexes === "undefined") {
        setContextIndexes = () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
        this.setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ??
          this.setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
      }
      button.removeEventListener("click", setContextIndexes);
      button.addEventListener("click", setContextIndexes);
    });

  }
  static dispose(bindingManager) {
    this.setContextIndexesByIdByBindingManager.delete(bindingManager);
  }
}