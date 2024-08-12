import { Loader, Registrar } from "../../modules/vanilla-module-loader/vanilla_module_loader.js";
import { EventFilterFuncWithOption, FilterFuncWithOption } from "../@types/filter";
import { registerComponentModule } from "../component/Component";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { ComponentModule } from "../@types/component.js";

const PREFIX = "*filter-";

function extendOf(module:typeof Object, extendClass:typeof Object):boolean {
  if (typeof module !== "function") return false;
  let testClass = module;
  while (testClass) {
    if (testClass === extendClass) return true;
    testClass = Object.getPrototypeOf(testClass);
  }
  return false;
}
type FilterFuncWithOptions = {
  output?:FilterFuncWithOption, 
  input?:FilterFuncWithOption, 
  event?:EventFilterFuncWithOption
}

class QuelModuleRegistrar extends Registrar {
  static register(name:string, module:Object|typeof Object) {
    if (name.startsWith(PREFIX)) {
      const filterName = name.slice(PREFIX.length);
      const { output, input, event }:FilterFuncWithOptions = 
        module as Object;
      output && OutputFilterManager.registerFilter(filterName, output);
      input && InputFilterManager.registerFilter(filterName, input);
      event && EventFilterManager.registerFilter(filterName, event);
    } else {
      if (extendOf(module as typeof Object, HTMLElement as unknown as typeof Object)) {
        customElements.define(name, module as CustomElementConstructor);
      } else {
        if ("State" in module && "html" in module) {
          registerComponentModule(name, module as ComponentModule);
        }
      }
    }
  }
}

export const loader = Loader.create(QuelModuleRegistrar);