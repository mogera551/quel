import "../types.js";
import { Loader, Registrar } from "../../modules/vanilla-module-loader/vanilla_module_loader.js";
import { Filter } from "../filter/Filter.js";
import { registComponentModule } from "../component/Component.js";

const PREFIX = "filter-";

class QuelModuleRegistrar extends Registrar {
  /**
   * 
   * @param {string} name 
   * @param {Object<string,any>} module 
   * @returns {void}
   */
  static regist(name, module) {
    if (name.startsWith(PREFIX)) {
      const filterName = name.slice(PREFIX.length);
      const { output, input } = module;
      Filter.regist(filterName, output, input);
    } else {
      registComponentModule(name, module);
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);
