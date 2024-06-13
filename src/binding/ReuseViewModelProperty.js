
/** @type {Object<string,import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty[]>} */
export const viewModelPropertiesByClassName = {};

/**
 * 
 * @param {typeof import("./viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor 
 * @param {[import("./Binding.js").Binding, string, FilterInfo[] ]} args 
 * @returns {port("./viewModelProperty/ViewModelProperty.js").ViewModelProperty}
 */
export const createViewModelProperty = (viewModelPropertyConstructor, args) => {
  return viewModelPropertiesByClassName[viewModelPropertyConstructor.name]?.pop()?.assign(...args) ??
    Reflect.construct(viewModelPropertyConstructor, args);
}
