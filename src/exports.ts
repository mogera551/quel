export { config } from "./Config";
export { getCustomTagFromImportMeta, importHtmlFromImportMeta, importCssFromImportMeta } from "./helper";
export { loader } from "./loader/QuelLoader";
export { bootFromImportMeta } from "./Boot";
export { generateComponentClass } from "./component/generateComponentClass";
export { registerComponentModules } from "./component/registerComponentModules";
export { loadSingleFileComponent } from "./component/loadSingleFileComponent";
export { registerSingleFileComponents } from "./component/registerSingleFileComponents";
export { generateSingleFileComponentClass } from "./component/generateSingleFileComponentClass";
import { EventFilterFuncWithOption, FilterFuncWithOption } from "./filter/types";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "./filter/Manager";
import { GlobalData } from "./global/Data";

type FilterFuncWithOptions = {
  input:FilterFuncWithOption, output:FilterFuncWithOption, event:EventFilterFuncWithOption
}

export function registerFilters(filters:{[key:string]:FilterFuncWithOptions}) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output, event }:FilterFuncWithOptions = filterData;
    input && InputFilterManager.registerFilter(name, input);
    output && OutputFilterManager.registerFilter(name, output);
    event && EventFilterManager.registerFilter(name, event);
  });
}

export function registerGlobal(data:{[key:string]:any}) {
  Object.assign(GlobalData.data, data);
}

import "./polyfill/load";
