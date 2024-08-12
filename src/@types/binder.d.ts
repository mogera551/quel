import { IBinding, IBindingManager, INodeProperty, IStateProperty } from "./binding";
import { IFilterInfo } from "./filter";

type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";
/*
enum NodeType {
  HTMLElement = 1,
  SVGElement = 2,
  Text = 3,
  Template = 4,
}
*/

type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  filters: IFilterInfo[];
}

type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterInfo[])=>INodeProperty;
type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterInfo[])=>IStateProperty;

type PropertyCreators = {
  nodePropertyCreator: NodePropertyCreator;
  statePropertyCreator: StatePropertyCreator;
}

type BindTextInfo = {
  createBinding: (bindingManager:IBindingManager,node:Node)=>IBinding;
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
  initializeNode: (node:Node,bindings:IBinding[])=>void;
}
