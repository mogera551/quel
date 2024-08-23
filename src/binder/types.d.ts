import { IBinding, IBindingManager, INodeProperty, IStateProperty } from "../@types/binding";
import { IFilterInfo } from "../@types/filter";
import { NodePropertyCreator, StatePropertyCreator } from "../@types/binder";

type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";

type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  filters: IFilterInfo[];
}

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
