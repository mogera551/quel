import "../types.js";
import { DependentProps } from "./DependentProps.js";
import { ReadOnlyViewModelHandler } from "./ReadOnlyViewModelHandler.js";
import { ViewModelize } from "./ViewModelize";
import { WritableViewModelHandler } from "./WritableViewModelHandler.js";

const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
/**
 * 
 * @param {Component} component 
 * @param {ViewModel.constructor} viewModelClass 
 * @returns {{readonly:Proxy,writable:Proxy}}
 */
export function createViewModels(component, viewModelClass) {
  const viewModelInfo = ViewModelize.viewModelize(Reflect.construct(viewModelClass, []));
  const { viewModel, accessorProps } = viewModelInfo;
  const setOfAccessorProperties = new Set(accessorProps);
  const dependentProps = new DependentProps();
  dependentProps.setDependentProps(viewModel[DEPENDENT_PROPS_PROPERTY] ?? {});
  return {
    "readonly": new Proxy(viewModel, new ReadOnlyViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "writable": new Proxy(viewModel, new WritableViewModelHandler(component, setOfAccessorProperties, dependentProps)),
  };
}