export { generateComponentClass, registerComponentModules } from "./component/Component.js";
export { loader } from "./loader/QuelLoader.js";
export { config } from "./Config.js";
export { getCustomTagFromImportMeta, importHtmlFromImportMeta, importCssFromImportMeta } from "../dist/helper.js";
export { bootFromImportMeta } from "./Boot.js";
import { Filter } from "./filter/Filter.js";
import { GlobalData } from "./global/Data.js";

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
export function registerFilters(filters) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output } = filterData;
    Filter.register(name, output, input);
  });
}

/**
 * 
 * @param {Object<string,any>} data 
 */
export function registerGlobal(data) {
  Object.assign(GlobalData.data, data);
}
