import { ComponentModule } from "../@types/component";
import { EventFilterFuncWithOption, FilterFuncWithOption } from "../@types/filter";
import { Loader } from "./Loader.js";
import { registerComponentModule } from "../newComponent/Component";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "../filter/Manager";
import { Registrar } from "./types";

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

const QuelLoaderRegistrar:Registrar = (name:string, module:any):void => {
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

export const loader = Loader.create(QuelLoaderRegistrar);
