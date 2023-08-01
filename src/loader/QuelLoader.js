import "../types.js";
import { Loader, Registrar } from "../../modules/vanilla-module-loader/vanilla_module_loader.js";
import { Filter } from "../filter/Filter";
import { Main } from "../main.js";

class QuelModuleRegistrar extends Registrar {
  static regist(name, module) {
    if (name.startsWith("filter-")) {
      const filterName = name.slice("filter-".length);
      const { output, input } = module;
      Filter.regist(filterName, output, input);
    } else {
      Main.registComponentModule(name, module);
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);
