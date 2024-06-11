/**
 * @typedef {Object} BindTextInfo
 * @property {string} nodeProperty bindするnodeのプロパティ名
 * @property {string} viewModelProperty bindするviewModelのプロパティ名
 * @property {FilterInfo[]} filters 適用するフィルターの配列
 * @property {NodeProperty.constructor} nodePropertyConstructor
 * @property {ViewModelProperty.constructor} viewModelPropertyConstructor
 * @property {(bindingManager:BindingManager,node:Node)=>Binding} bindingCreator
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
 * @property {(node:Node,bindings:Binding[])=>{}} nodeInitializer
 */