import { IBindNodeInfo } from "./types";
import { findNodeByNodeRoute } from "./nodeRoute";
import { IContentBindings, IBinding } from "../binding/types";

export function createBindings(content: DocumentFragment, contentBindings: IContentBindings, nodeInfos: IBindNodeInfo[]): IBinding[] {
  const bindings: IBinding[] = [];
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
