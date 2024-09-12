import { IBindingNode } from "./types";
import { findNodeByNodeRoute } from "./findNodeByNodeRoute";
import { IContentBindings, IBinding } from "../binding/types";

/**
 * HTMLテンプレートのコンテントからバインディング配列を作成する
 */
export function createBindings(content: DocumentFragment, contentBindings: IContentBindings, nodeInfos: IBindingNode[]): IBinding[] {
  const bindings: IBinding[] = [];
  for(let i = 0; i < nodeInfos.length; i++) {
    const nodeInfo = nodeInfos[i];
    const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
    const nodeBindings = [];
    for(let j = 0; j < nodeInfo.bindTexts.length; j++) {
      nodeBindings[nodeBindings.length] = 
        nodeInfo.bindTexts[j].createBinding(contentBindings, node); // push
    }
    nodeInfo.initializeForNode(node, nodeBindings);
    bindings.push(...nodeBindings);
  }
  return bindings;
}
