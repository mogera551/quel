import { IBinding, IBindingManager, INodeProperty, IStateProperty } from "../@types/binding";
import { IFilterInfo } from "../@types/filter";

type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterInfo[])=>INodeProperty;
type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterInfo[])=>IStateProperty;
