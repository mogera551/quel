import { getNodePropertyConstructor } from "./nodePropertyConstructor";
import { getStatePropertyConstructor } from "./statePropertyConstructor";
import { PropertyCreators } from "./types";

export function getPropertyCreators(node:Node, nodePropertyName:string, statePropertyName:string, useKeyed:boolean):PropertyCreators {
  return { 
    nodePropertyCreator: getNodePropertyConstructor(node, nodePropertyName, useKeyed),
    statePropertyCreator: getStatePropertyConstructor(statePropertyName), 
  };
}
