export { generateComponentClass, registerComponentModules } from "./component/Component.js";
export { loader } from "./loader/QuelLoader.js";
export { config } from "./Config.js";
export { getCustomTagFromImportMeta, importHtmlFromImportMeta, importCssFromImportMeta } from "../dist/helper.js";
export { bootFromImportMeta } from "./Boot.js";
import { EventFilterManager, InputFilterManager, OutputFilterManager } from "./filter/Manager.js";
import { GlobalData } from "./global/Data.js";
export { loadSingleFileComponent, registerSingleFileComponents } from "./component/SingleFile.js";

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
export function registerFilters(filters) {
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
