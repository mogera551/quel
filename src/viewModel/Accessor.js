import Component from "../component/Component.js";
import "../types.js";
import utils from "../utils.js";
import PropertyInfo from "./PropertyInfo.js";

const skipPrivate = property => property[0] !== "_";

export default class {
  /**
   * 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @returns {ViewModel}
   */
  static convert(component, viewModel) {
    const accessorProperties = 
      Object.keys(viewModel).filter(skipPrivate).map(property => PropertyInfo.create(property));

    accessorProperties.forEach(property => {
      const value = viewModel[property.name];
      delete viewModel[property.name];
      const desc = property.createPropertyDescriptor(component);
      Object.defineProperty(viewModel, property.name, desc);

      if (!(property.privateName in viewModel)) {
        const privateDesc = {
          value,
          writable: true, 
          enumerable: false, 
          configurable: true,
        }
        Object.defineProperty(viewModel, property.privateName, privateDesc);
      }
    });

    return viewModel;

  }
}