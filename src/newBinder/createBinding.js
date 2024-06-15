import "../types.js";
import { Binding, BindingManager } from "../binding/Binding.js";

/** 
 * @type {(bindTextInfo:BindTextInfo)=>(bindingManager:BindingManager,node:Node)=>Binding} 
 * create binding from bindTextInfo, bindingManager and node
 */
export const createBinding = (bindTextInfo) => (bindingManager, node) => Binding.create(
  bindingManager,
  node, bindTextInfo.nodeProperty, bindTextInfo.nodePropertyConstructor, 
  bindTextInfo.viewModelProperty, bindTextInfo.viewModelPropertyConstructor, 
  bindTextInfo.filters
);
