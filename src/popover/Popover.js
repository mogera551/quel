
export class Popover {

  static setLoopContextByIdByLoopContext = new Map;
  static initialize(bindingManager, content) {
    const buttons = Array.from(content.querySelectorAll("[popovertarget]"));
    if (buttons.length === 0) return;
    const loopContext = bindingManager.loopContext;
    const component = bindingManager.component;
    buttons.forEach(button => {
      const id = button.getAttribute("popovertarget");
      let setLoopContext = this.setLoopContextByIdByLoopContext.get(loopContext)?.get(id);
      if (typeof setLoopContext === "undefined") {
        setLoopContext = () => component.popoverLoopContextById.set(id, loopContext);
        this.setLoopContextByIdByLoopContext.get(loopContext) ??
          this.setLoopContextByIdByLoopContext.set(loopContext, new Map);
        this.setLoopContextByIdByLoopContext.get(loopContext).set(id, setLoopContext);
      }
      button.removeEventListener("click", setLoopContext);
      button.addEventListener("click", setLoopContext);
    });

  }
}