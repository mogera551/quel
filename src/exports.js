export { generateComponentClass, registComponentModules } from "./component/Component.js";
export { loader } from "./loader/QuelLoader.js";
export { config } from "./Config.js";
import { Filter } from "./filter/Filter.js";
import { GlobalData } from "./global/Data.js";
import { Dialog } from "./viewModel/Dialog.js";

/**
 * 
 * @param {Object<string,UserFilterData>} filters 
 */
export function registFilters(filters) {
  Object.entries(filters).forEach(([name, filterData]) => {
    const { input, output } = filterData;
    Filter.regist(name, output, input);
  });
}

/**
 * 
 * @param {Object<string,any>} data 
 */
export function registGlobal(data) {
  Object.assign(GlobalData.data, data);
}

export async function openDialog(dialogName, data, attributes) {
  return Dialog.open(dialogName, data, attributes);
}
