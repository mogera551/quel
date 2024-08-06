import { Binding, BindingManager } from "../binding/Binding.js";
import { NodeProperty } from "../binding/nodeProperty/NodeProperty.js";
import { StateProperty } from "../binding/stateProperty/StateProperty.js";
import { FilterInfo } from "../filter/Manager.js";

export enum NodeType {
  HTMLElement = 1,
  SVGElement = 2,
  Text = 3,
  Template = 4,
  Unknown = -1,
}

export type ParseBindTextInfo = {
  nodeProperty: string;
  stateProperty: string;
  filters: FilterInfo[];
}

export type Constructors = {
  nodePropertyConstructor: typeof NodeProperty;
  statePropertyConstructor: typeof StateProperty;
}

export type BindTextInfo = {
  createBinding: (bindingManager:BindingManager,node:Node)=>Binding;
} & ParseBindTextInfo & Constructors;

export type NodeRoute = number[];

export type NodeRouteKey = string; // NodeRoute.join(",")

export interface BindNodeInfoIf {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  isInputable: boolean;
  defaultProperty: string;
  initializeNode: (node:Node,bindings:Binding[])=>void;
}
