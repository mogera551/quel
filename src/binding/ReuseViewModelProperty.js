
/** @type {Object<string,import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty[]>} */
export const viewModelPropertiesByClassName = {};

/**
 * 
 * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
 * @param {[import("./Binding.js").Binding, string, FilterInfo[] ]} args 
 * @returns {port("./viewModelProperty/ViewModelProperty.js").ViewModelProperty}
 */
export const createViewModelProperty = (viewModelPropertyConstructor, args) => {
  const viewModelProperty = viewModelPropertiesByClassName[viewModelPropertyConstructor.name]?.pop();
  if (typeof viewModelProperty !== "undefined") {
    viewModelProperty.assign(...args);
    return viewModelProperty;
  }
  return Reflect.construct(viewModelPropertyConstructor, args);
}
