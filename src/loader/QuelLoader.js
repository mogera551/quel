import "../types.js";
import { Loader, Registrar } from "../../modules/vanilla-module-loader/vanilla_module_loader.js";
import { Filter } from "../filter/Filter.js";
import { registerComponentModule } from "../component/Component.js";

const PREFIX = "*filter-";

function extendOf(module, extendClass) {
  if (typeof module !== "function") return false;
  let testClass = module;
  while (testClass) {
    if (testClass === extendClass) return true;
    testClass = Object.getPrototypeOf(testClass);
  }
  return false;
}

class QuelModuleRegistrar extends Registrar {
  /**
   * 
   * @param {string} name 
   * @param {Object<string,any>} module 
   * @returns {void}
   */
  static register(name, module) {
    if (name.startsWith(PREFIX)) {
      const filterName = name.slice(PREFIX.length);
      const { output, input, event } = module;
      Filter.register(filterName, output, input, event);
    } else {
      if (extendOf(module, HTMLElement)) {
        customElements.define(name, module);
      } else {
        if ("ViewModel" in module && "html" in module) {
          registerComponentModule(name, module);
        }
      }
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);
