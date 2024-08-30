import { IBindNodeInfo } from "../@types/binder";
import { findNodeByNodeRoute } from "./nodeRoute";
import { IContentBindings, INewBinding } from "../@types/types";

export function createBindings(content:DocumentFragment, contentBindings:IContentBindings, nodeInfos:IBindNodeInfo[]):INewBinding[] {
  const bindings:INewBinding[] =[];
  for(let i = 0; i < nodeInfos.length; i++) {
    const nodeInfo = nodeInfos[i];
    const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
    const nodeBindings = [];
    for(let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
      nodeBindings[nodeBindings.length] = 
        nodeInfo.bindTextInfos[j].createBinding(contentBindings, node); // push
    }
    nodeInfo.initializeNode(node, nodeBindings);
    bindings.push(...nodeBindings);
  }
  return bindings;
}
