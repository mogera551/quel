import "../types_.js";
import { DependentProps } from "./DependentProps.js";
import { ReadOnlyViewModelHandler } from "./ReadOnlyViewModelHandler.js";
import { viewModelize } from "./ViewModelize.js";
import { WritableViewModelHandler } from "./WritableViewModelHandler.js";

const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
/**
 * 
 * @param {Component} component 
 * @param {ViewModel.constructor} viewModelClass 
 * @returns {{readonly:Proxy,writable:Proxy}}
 */
export function createViewModels(component, viewModelClass) {
  const { viewModel, accessorProps } = viewModelize(Reflect.construct(viewModelClass, []));
  const setOfAccessorProperties = new Set(accessorProps);
  const dependentProps = new DependentProps();
  dependentProps.setDependentProps(viewModel[DEPENDENT_PROPS_PROPERTY] ?? {});
  return {
    "readonly": new Proxy(viewModel, new ReadOnlyViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "writable": new Proxy(viewModel, new WritableViewModelHandler(component, setOfAccessorProperties, dependentProps)),
    "base": viewModel,
  };
}