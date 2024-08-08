
/**
 * 
 * @param {typeof Compoenent} componentClass 
 * @param {string} extendsTag 
 * @returns {typeof Compoenent}
 */
export function replaceBaseClass(componentClass, extendsTag) {
  const extendClass = document.createElement(extendsTag).constructor;
  componentClass.prototype.__proto__ = extendClass.prototype;
  componentClass.__proto__ = extendClass;
  return componentClass;
}