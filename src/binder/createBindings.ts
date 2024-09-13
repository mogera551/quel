import { IBindingNode } from "./types";
import { findNodeByNodeRoute } from "./findNodeByNodeRoute";
import { IContentBindings, IBinding } from "../binding/types";

/**
 * HTMLテンプレートのコンテントからバインディング配列を作成する
 */
export function createBindings(
  content: DocumentFragment, 
  contentBindings: IContentBindings, 
  bindingNodes: Pick<IBindingNode, "nodeRoute" | "bindTexts" | "initializeForNode">[]
): IBinding[] {
  const bindings: IBinding[] = [];
  for(let i = 0; i < bindingNodes.length; i++) {
    const bindingNode = bindingNodes[i];
    const node = findNodeByNodeRoute(content, bindingNode.nodeRoute);
    const tempBindings = [];
    for(let j = 0; j < bindingNode.bindTexts.length; j++) {
      tempBindings[tempBindings.length] = 
        bindingNode.bindTexts[j].createBinding(contentBindings, node); // push
    }
    bindingNode.initializeForNode(node, tempBindings);
    bindings.push(...tempBindings);
  }
  return bindings;
}
