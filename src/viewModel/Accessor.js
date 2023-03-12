import Component from "../component/Component.js";
import "../types.js";
import utils from "../utils.js";
import PropertyInfo from "./PropertyInfo.js";

const notPrivate = property => property[0] !== "_";
const DEPENDENT_PROP = "$dependentProps";

/**
 * 
 * @param {{prop:string,refProps:string[]}[]} dependentProps
 * @returns 
 */
function createDependentMap(dependentProps) {
  const map = new Map();
  Object.entries(dependentProps).forEach(([prop, refProps]) => {
    refProps.forEach(refProp => {
      map.get(refProp)?.push(prop) ?? map.set(refProp, [ prop ]);
    }) 
  });
  return map;
}

export default class {
  /**
   * 
   * @param {Component} component
   * @param {ViewModel} viewModel 
   * @returns {{viewmodel:ViewModel, definedProperties:PropertyInfo[], dependentMap:Map<string,string[]>, cachablePropertyNames:string[]}}
   */
  static convert(component, viewModel) {
    let dependentMap = new Map;
    // $dependentPropsを取得
    if (DEPENDENT_PROP in viewModel) {
      const desc = Object.getOwnPropertyDescriptor(viewModel, DEPENDENT_PROP);
      desc.enumerable = false;
      Object.defineProperty(viewModel, DEPENDENT_PROP, desc);
      dependentMap = createDependentMap(desc.value);
    }
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
    const cachablePropertyNames = [];
    for(const [prop, desc] of Object.entries(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(viewModel)))) {
      if (prop === "constructor") continue;
      if (utils.isFunction(desc.value)) continue;
      desc.enumerable = true;
      Object.defineProperty(viewModel, prop, desc);
      cachablePropertyNames.push(prop);
    }
    const definedProperties = Object.keys(viewModel).map(prop => PropertyInfo.create(prop));

    // definedPropertiesからdependentMapに追加
    definedProperties.forEach(property => {
      if (property.isPrimitive) return;
      const props = dependentMap.get(property.parentName)?.concat(property.name) ?? [ property.name ];
      dependentMap.set(property.parentName, props);
    });

    return { viewModel, definedProperties, dependentMap, cachablePropertyNames };

  }
}