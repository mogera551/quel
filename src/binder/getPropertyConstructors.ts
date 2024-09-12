import { getNodePropertyConstructor } from "./getNodePropertyConstructor";
import { getStatePropertyConstructor } from "./getStatePropertyConstructor";
import { PropertyConstructors } from "./types";

/**
 * バインドのノードプロパティとステートプロパティのコンストラクタを取得する
 */
export function getPropertyConstructors(node:Node, nodePropertyName:string, statePropertyName:string, useKeyed:boolean):PropertyConstructors {
  return { 
    nodePropertyConstructor: getNodePropertyConstructor(node, nodePropertyName, useKeyed),
    statePropertyConstructor: getStatePropertyConstructor(statePropertyName), 
  };
}
