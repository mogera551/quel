export { generateComponentClass, registerComponentModules } from "./component/Component";
export { loader } from "./loader/QuelLoader";
export { config } from "./Config";
export { getCustomTagFromImportMeta, importHtmlFromImportMeta, importCssFromImportMeta } from "../dist/helper.js";
export { bootFromImportMeta } from "./Boot";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "./filter/Manager";
import { GlobalData } from "./global/Data";
export { loadSingleFileComponent, registerSingleFileComponents } from "./component/SingleFile";

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
export function registerFilters(filters:{[key:string]:UserFilterData}) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output, event } = filterData;
    input && InputFilterManager.registerFilter(name, input);
    output && OutputFilterManager.registerFilter(name, output);
    event && EventFilterManager.registerFilter(name, event);
  });
}

/**
 * 
 * @param {Object<string,any>} data 
 */
export function registerGlobal(data) {
  Object.assign(GlobalData.data, data);
}
