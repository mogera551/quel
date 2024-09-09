import { IBinding, IContentBindings, INodeProperty, IStateProperty } from "../binding/types";
import { IFilterInfo } from "../filter/types";

export type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) => INodeProperty;
export type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterInfo[]) => IStateProperty;

export type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";

export type ParsedBindTextInfo = {
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
  createBinding: (contentBindings: IContentBindings, node: Node) => IBinding;
} & ParsedBindTextInfo & PropertyCreators;

export type NodeRoute = number[];

export type NodeRouteKey = string; // NodeRoute.join(",")

export interface IBindNodeInfo {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  acceptInput: boolean;
  defaultProperty: string;
  initializeForNode(node:Node, bindings:IBinding[]):void;
}

export interface IBinder {
  createBindings(content:DocumentFragment, contentBindings:IContentBindings):IBinding[];
}
