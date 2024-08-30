import { INewBinding, IContentBindings, INewNodeProperty, INewStateProperty } from "./binding";
import { IStateProxy } from "../newState/types";
import { IFilterInfo } from "./filter";

type NodePropertyCreator = (binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) => INewNodeProperty;
type StatePropertyCreator = (binding:INewBinding, name:string, filters:IFilterInfo[]) => INewStateProperty;

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
  createBinding: (contentBindings:IContentBindings,node:Node)=>INewBinding;
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
  initializeNode(node:Node, bindings:INewBinding[]):void;
}

interface IBinder {
  createBindings(content:DocumentFragment, contentBindings:IContentBindings):INewBinding[];
}
