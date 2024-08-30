import { IBinding, IContentBindings, INodeProperty, IStateProperty } from "./binding";
import { IStateProxy } from "../newState/types";
import { IFilterInfo } from "./filter";

type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) => INodeProperty;
type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterInfo[]) => IStateProperty;

type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";

type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  inputFilters: IFilterInfo[];
  outputFilters: IFilterInfo[];
}

type PropertyCreators = {
  nodePropertyCreator: NodePropertyCreator;
  statePropertyCreator: StatePropertyCreator;
}

type BindTextInfo = {
  createBinding: (contentBindings:IContentBindings,node:Node)=>IBinding;
} & ParseBindTextInfo & PropertyCreators;

type NodeRoute = number[];

type NodeRouteKey = string; // NodeRoute.join(",")

interface IBindNodeInfo {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  isInputable: boolean;
  defaultProperty: string;
  initializeNode(node:Node, bindings:IBinding[]):void;
}

interface IBinder {
  createBindings(content:DocumentFragment, contentBindings:IContentBindings):IBinding[];
}
