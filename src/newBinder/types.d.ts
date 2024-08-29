import { INewBinding, IContentBindings, INewNodeProperty, INewStateProperty } from "../newBinding/types";
import { IStateProxy } from "../newState/types";
import { IFilterInfo } from "../@types/filter";

export type NodePropertyCreator = (binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) => INewNodeProperty;
export type StatePropertyCreator = (binding:INewBinding, name:string, filters:IFilterInfo[]) => INewStateProperty;

export type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";

export type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  inputFilters: IFilterInfo[];
  outputFilters: IFilterInfo[];
}

export type PropertyCreators = {
  nodePropertyCreator: NodePropertyCreator;
  statePropertyCreator: StatePropertyCreator;
}

export type BindTextInfo = {
  createBinding: (contentBindings:IContentBindings,node:Node)=>INewBinding;
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
  initializeNode(node:Node, bindings:INewBinding[]):void;
}

export interface IBinder {
  createBindings(content:DocumentFragment, contentBindings:IContentBindings):INewBinding[];
}
