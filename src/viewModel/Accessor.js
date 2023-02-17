import Component from "../component/Component.js";
import "../types.js";
import utils from "../utils.js";
import PropertyInfo from "./PropertyInfo.js";

const notPrivate = property => property[0] !== "_";

export default class {
  /**
   * 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @returns {{viewmodel:ViewModel, definedProperties:PropertyInfo[]}}
   */
  static convert(component, viewModel) {
    // プライベートプロパティを列挙不可にする
    for(const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(viewModel))) {
      if (notPrivate(prop)) continue;
      desc.enumerable = false;
      Object.defineProperty(viewModel, prop, desc);
    }

    // 普通のプロパティをgetter/setter化する
    const accessorProperties = 
      Object.keys(viewModel).filter(notPrivate).map(property => PropertyInfo.create(property));

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

    // getterを列挙可にする
    for(const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(viewModel)))) {
      if (prop === "constructor") continue;
      if (utils.isFunction(desc.value)) continue;
      desc.enumerable = true;
      Object.defineProperty(viewModel, prop, desc);
    }
    const definedProperties = Object.keys(viewModel).map(prop => PropertyInfo.create(prop));

    return { viewModel, definedProperties };

  }
}