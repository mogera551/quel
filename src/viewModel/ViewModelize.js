import "../types.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

/**
 * @typedef {Object} ViewModelInfo
 * @property {string[]} removeProps
 * @property {string[]} definedProps
 * @property {string[]} accessorProps
 * @property {string[]} methods
 */

/**
 * オブジェクトのすべてのプロパティのデスクリプタを取得する
 * 継承元を遡る、ただし、Objectのプロパティは取得しない
 * @param {ViewModel} target 
 * @returns {Map<string,PropertyDescriptor>}
 */
function getDescByName(target) {
  /**
   * @type {Map<string,PropertyDescriptor>}
   */
  const descByName = new Map;
  let object = target;
  while(object !== Object.prototype) {
    const descs = Object.getOwnPropertyDescriptors(object);
    for(const [name, desc] of Object.entries(descs)) {
      if (descByName.has(name)) continue;
      descByName.set(name, desc);
    }
    object = Object.getPrototypeOf(object);
  }
  return descByName;
}

/**
 * オブジェクト内のメソッドを取得する
 * コンストラクタは含まない
 * @param {[string,PropertyDescriptor][]} descByNameEntries 
 * @returns {[string,PropertyDescriptor][]}
 */
function getMethods(descByNameEntries, targetClass) {
  return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value === "function")
}

/**
 * オブジェクト内のプロパティを取得する
 * @param {[string,PropertyDescriptor][]} descByNameEntries 
 * @returns {[string,PropertyDescriptor][]}
 */
function getProperties(descByNameEntries, targetClass) {
  return descByNameEntries.filter(([ name, desc ]) => desc.value !== targetClass && typeof desc.value !== "function")
}

/** @type {Map<typeof ViewModel,ViewModelInfo>} */
const viewModelInfoByConstructor = new Map;

/**
 * ViewModel化
 * ・非プリミティブかつ初期値のないプロパティは削除する
 * @param {ViewModel} target 
 * @returns {{
 *   definedProps:string[],
 *   primitiveProps:string[],
 *   methods:string[],
 *   accessorProps:string[],
 *   viewModel:ViewModel
 * }}
 */
export function viewModelize(target) {
  let viewModelInfo = viewModelInfoByConstructor.get(target.constructor);
  if (!viewModelInfo) {
    const descByName = getDescByName(target);
    const descByNameEntries = Array.from(descByName.entries());
    const removeProps = [];
    const definedProps = [];
    const primitiveProps = [];
    const accessorProps = [];
    const methods = getMethods(descByNameEntries, target.constructor).map(([name, desc]) => name);
    getProperties(descByNameEntries, target.constructor).forEach(([name, desc]) => {
      definedProps.push(name);
      const propName = PropertyName.create(name);
      if (propName.isPrimitive) {
        primitiveProps.push(name);
      } else {
        if (("value" in desc) && typeof desc.value === "undefined") {
          removeProps.push(name);
        }
      }
      if ("get" in desc && typeof desc.get !== "undefined") {
        accessorProps.push(name);
      }
    });
    viewModelInfo = { removeProps, definedProps, primitiveProps, methods, accessorProps };
    viewModelInfoByConstructor.set(target.constructor, viewModelInfo);
  }
  viewModelInfo.removeProps.forEach(propertyKey => Reflect.deleteProperty(target, propertyKey));
  return {
    definedProps:viewModelInfo.definedProps, 
    primitiveProps:viewModelInfo.primitiveProps,
    methods:viewModelInfo.methods, 
    accessorProps:viewModelInfo.accessorProps,
    viewModel:target
  };
}
