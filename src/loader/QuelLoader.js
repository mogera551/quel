import { Loader, Registrar } from "./vanilla_module_loader.min.js";
import Filter from "../filter/Filter";
import Component from "../component/Component.js";

class QuelModuleRegistrar extends Registrar {
  static regist(name, module) {
    if (name.startsWith("filter-")) {
      const filterName = name.slice("filter-".length);
      const { output, input } = module;
      Filter.regist(filterName, output, input);
    } else {
      const tagName = name;
      if (module instanceof HTMLElement) {
        window.customElements.define(tagName, module);
      } else {
        window.customElements.define(tagName, Component.getClass(module));
      }
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);
