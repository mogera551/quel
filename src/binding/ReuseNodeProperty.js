
/** @type {Object<string,import("./nodeProperty/NodeProperty.js").NodeProperty[]>} */
export const nodePropertiesByClassName = {};

/**
 * 
 * @param {typeof import("./nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor 
 * @param {[ import("./Binding.js").Binding, Node, string, FilterInfo[] ]} args 
 * @returns {import("./nodeProperty/NodeProperty.js").NodeProperty}
 */
export const createNodeProperty = (nodePropertyConstructor, args) => {
  //return nodePropertiesByClassName[nodePropertyConstructor.name]?.pop()?.assign(...args) ??
    return Reflect.construct(nodePropertyConstructor, args);
}
