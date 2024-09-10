import { getNodePropertyConstructor } from "./getNodePropertyConstructor";
import { getStatePropertyConstructor } from "./getStatePropertyConstructor";
import { PropertyCreators } from "./types";

/**
 * バインドのノードプロパティとステートプロパティのコンストラクタを取得する
 */
export function getPropertyCreators(node:Node, nodePropertyName:string, statePropertyName:string, useKeyed:boolean):PropertyCreators {
  return { 
    nodePropertyCreator: getNodePropertyConstructor(node, nodePropertyName, useKeyed),
    statePropertyCreator: getStatePropertyConstructor(statePropertyName), 
  };
}