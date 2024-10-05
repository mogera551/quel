import { getNodePropertyConstructor } from "./getNodePropertyConstructor";
import { getStatePropertyConstructor } from "./getStatePropertyConstructor";
import { PropertyConstructors } from "./types";

/**
 * バインドのノードプロパティとステートプロパティのコンストラクタを取得する
 * @param node ノード
 * @param nodePropertyName ノードプロパティ名
 * @param statePropertyName ステートプロパティ名
 * @param useKeyed キー付きのプロパティを使用するかどうか
 * @returns {PropertyConstructors} プロパティコンストラクタ
 */
export function getPropertyConstructors(
  node: Node, 
  nodePropertyName: string, 
  statePropertyName: string, 
  useKeyed: boolean
): PropertyConstructors {
  return { 
    nodePropertyConstructor: getNodePropertyConstructor(node, nodePropertyName, useKeyed),
    statePropertyConstructor: getStatePropertyConstructor(statePropertyName), 
  };
}
