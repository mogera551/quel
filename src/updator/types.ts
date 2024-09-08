
import { IProcess } from "../component/types";
import { IPropertyAccess } from "../binding/types";
import { IBinding, IBindingSummary } from "../binding/types";
import { IStates } from "../state/types";

export interface IUpdator {
  //  component: IComponent;
//  readonly processQueue: IProcess[];
//  readonly updatedStateProperties: IPropertyAccess[];
//  readonly expandedStateProperties: IPropertyAccess[];
//  readonly updatedBindings: Set<IBinding>;
//  readonly states: IStates;
//  readonly bindingSummary: IBindingSummary;

  executing: boolean;

  addProcess(target: Function, thisArgument: object, argumentList: any[]): void;
  retrieveAllProcesses(): IProcess[];

  addUpdatedStateProperty(prop: IPropertyAccess): void;
  retrieveAllUpdatedStateProperties(): IPropertyAccess[];

  addBindingForUpdateNode(binding: IBinding): void;
  retrieveAllBindingsForUpdate(): IBinding[];

//  process():Promise<IPropertyAccess[]>;
//  expandStateProperties(updatedStateProperties: IPropertyAccess[]): IPropertyAccess[];
//  rebuildBinding(expandedStatePropertyByKey: Map<string,IPropertyAccess>): void;
//  updateChildNodes(expandedStateProperties: IPropertyAccess[]): void;
//  updateNode(expandedStatePropertyByKey: Map<string, IPropertyAccess>): void;
//  execCallback(callback: ()=>any): Promise<void>;
  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: IBinding, callback:(updator: IUpdator)=>any): void;
}

export type UpdateInfo = { name:string, indexes:number[] }
  