import "../types.js";
import { Loader, Registrar } from "../../modules/vanilla-module-loader/vanilla_module_loader.js";
import { Filter } from "../filter/Filter.js";
import { registerComponentModule } from "../component/Component.js";

const PREFIX = "filter-";

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
      const { output, input } = module;
      Filter.register(filterName, output, input);
    } else {
      registerComponentModule(name, module);
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);
