import { IBinding, IBindingManager } from "../binding/types";
import { findNodeByNodeRoute } from "./nodeRoute";
import { IBindNodeInfo } from "./types";

export function createBindings(content:DocumentFragment, bindingManager:IBindingManager, nodeInfos:IBindNodeInfo[]):IBinding[] {
  const bindings:IBinding[] =[];
  for(let i = 0; i < nodeInfos.length; i++) {
    const nodeInfo = nodeInfos[i];
    const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
    const nodeBindings = [];
    for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
      nodeBindings[nodeBindings.length] = 
        nodeInfo.bindTextInfos[j].createBinding(bindingManager, node); // push
    }
    nodeInfo.initializeNode(node, nodeBindings);
    bindings.push(...nodeBindings);
  }
  return bindings;
}
