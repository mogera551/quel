
/**
 * @typedef {Object} BindTextInfo
 * @property {string} nodeProperty property name of node to bind
 * @property {string} viewModelProperty property name of viewModel to bind
 * @property {FilterInfo[]} filters filter information list
 * @property {typeof import("../binding/nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
 * @property {typeof import("../binding/viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor
 * @property {(bindingManager:BindingManager,node:Node)=>Binding} createBinding
 */

/** @typedef {number[]} NodeRoute */
/** @typedef {string} NodeRouteKey NodeRoute.join(",") */

/**
 * @typedef {Object} BindNodeInfo
 * @property {NodeType} nodeType
 * @property {NodeRoute} nodeRoute
 * @property {NodeRouteKey} nodeRouteKey
 * @property {BindTextInfo[]} bindTextInfos
 * @property {boolean} isInputable
 * @property {string} defaultProperty
 * @property {(node:Node,bindings:Binding[])=>{}} initializeNode
 */