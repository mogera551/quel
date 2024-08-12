export { generateComponentClass, registerComponentModules } from "./component/Component";
export { loader } from "./loader/QuelLoader";
export { config } from "./Config";
export { getCustomTagFromImportMeta, importHtmlFromImportMeta, importCssFromImportMeta } from "./helper";
export { bootFromImportMeta } from "./Boot";
import { EventFilterFuncWithOption, FilterFuncWithOption } from "./@types/filter";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "./filter/Manager";
import { GlobalData } from "./global/Data";
export { loadSingleFileComponent, registerSingleFileComponents } from "./component/SingleFile";

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

await import("./polyfill/load");
