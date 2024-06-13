
/**
 * @typedef {Object} BindTextInfo
 * @property {string} nodeProperty bindするnodeのプロパティ名
 * @property {string} viewModelProperty bindするviewModelのプロパティ名
 * @property {FilterInfo[]} filters 適用するフィルターの配列
 * @property {typeof import("../binding/nodeProperty/NodeProperty.js").NodeProperty} nodePropertyConstructor
 * @property {typeof import("../binding/viewModelProperty/ViewModelProperty.js").ViewModelProperty} viewModelPropertyConstructor
 * @property {(bindingManager:BindingManager,node:Node)=>Binding} createBindingFn
 */

/** @typedef {number[]} NodeRoute */
/** @typedef {string} NodeRouteKey RouteNode.join(",")したもの */

/**
 * @typedef {Object} BindNodeInfo
 * @property {NodeType} nodeType
 * @property {NodeRoute} nodeRoute
 * @property {NodeRouteKey} nodeRouteKey
 * @property {BindTextInfo[]} bindTextInfos
 * @property {boolean} isInputable
 * @property {string} defaultProperty
 * @property {(node:Node,bindings:Binding[])=>{}} nodeInitializeFn
 */