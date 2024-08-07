import { IBinding, IBindingManager, INodeProperty, IStateProperty } from "../binding/types";
import { IFilterInfo } from "../filter/types";

export enum NodeType {
  HTMLElement = 1,
  SVGElement = 2,
  Text = 3,
  Template = 4,
}

export type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  filters: IFilterInfo[];
}

export type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterInfo[])=>INodeProperty;
export type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterInfo[])=>IStateProperty;

export type PropertyCreators = {
  nodePropertyCreator: NodePropertyCreator;
  statePropertyCreator: StatePropertyCreator;
}

export type BindTextInfo = {
  createBinding: (bindingManager:IBindingManager,node:Node)=>IBinding;
} & ParseBindTextInfo & PropertyCreators;

export type NodeRoute = number[];

export type NodeRouteKey = string; // NodeRoute.join(",")

export interface IBindNodeInfo {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  isInputable: boolean;
  defaultProperty: string;
  initializeNode: (node:Node,bindings:IBinding[])=>void;
}
