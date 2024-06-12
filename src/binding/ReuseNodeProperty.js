
/** @type {Object<string,import("./nodeProperty/NodeProperty.js").NodeProperty[]>} */
export const nodePropertiesByClassName = {};

/**
 * 
 * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor 
 * @param {[ import("./Binding.js").Binding, Node, string, FilterInfo[] ]} args 
 * @returns {import("./nodeProperty/NodeProperty.js").NodeProperty}
 */
export const createNodeProperty = (nodePropertyConstructor, args) => {
  const nodeProperty = nodePropertiesByClassName[nodePropertyConstructor.name]?.pop();
  if (typeof nodeProperty !== "undefined") {
    nodeProperty.assign(...args);
    return nodeProperty;
  }
  return Reflect.construct(nodePropertyConstructor, args);
}
