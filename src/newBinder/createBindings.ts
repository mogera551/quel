import { Binding, BindingManager } from "../binding/Binding";
import { findNodeByNodeRoute } from "./nodeRoute";
import { BindNodeInfoIf } from "./types";

export function createBindings(content:DocumentFragment, bindingManager:BindingManager, nodeInfos:BindNodeInfoIf[]):Binding[] {
  const bindings:Binding[] =[];
  for(let i = 0; i < nodeInfos.length; i++) {
    const nodeInfo = nodeInfos[i];
    const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
    const nodeBindings = [];
    for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
      nodeBindings[nodeBindings.length] = 
        nodeInfo.bindTextInfos[j].createBinding(bindingManager, node); // push
    }
    nodeInfo.initializeNode?.(node, nodeBindings);
    bindings.push(...nodeBindings);
  }
  return bindings;
}
