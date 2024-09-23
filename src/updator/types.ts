
import { IProcess } from "../component/types";
import { IPropertyAccess } from "../binding/types";
import { IBinding, IBindingSummary } from "../binding/types";
import { IStates } from "../state/types";

export interface IUpdator {
  executing: boolean;

  addProcess(target: Function, thisArgument: object | undefined, argumentList: any[]): void;
  retrieveAllProcesses(): IProcess[];

  addUpdatedStateProperty(prop: IPropertyAccess): void;
  retrieveAllUpdatedStateProperties(): IPropertyAccess[];

  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: IBinding, callback:(updator: IUpdator)=>any): void;

  readonly isFullRebuild: boolean;
  setFullRebuild(isFullRebuild:boolean, callback:()=>any): void;
}

export type UpdateInfo = { name:string, indexes:number[] }
  