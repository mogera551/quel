
import { IProcess } from "../component/types";
import { IPropertyAccess } from "../binding/types";
import { IBinding, IBindingSummary } from "../binding/types";
import { IStates } from "../state/types";

export interface IUpdator {
  executing: boolean;

  addProcess(target: Function, thisArgument: object, argumentList: any[]): void;
  retrieveAllProcesses(): IProcess[];

  addUpdatedStateProperty(prop: IPropertyAccess): void;
  retrieveAllUpdatedStateProperties(): IPropertyAccess[];

  addBindingForUpdateNode(binding: IBinding): void;
  retrieveAllBindingsForUpdate(): IBinding[];

  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: IBinding, callback:(updator: IUpdator)=>any): void;
}

export type UpdateInfo = { name:string, indexes:number[] }
  