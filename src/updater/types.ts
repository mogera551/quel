
import { IProcess } from "../component/types";
import { IBinding } from "../binding/types";
import { ILoopContext, ILoopContextStack, INamedLoopIndexesStack } from "../loopContext/types";
import { IStatePropertyAccessor } from "../state/types";

export interface IUpdater {
  executing: boolean;
  loopContextStack: ILoopContextStack;
  namedLoopIndexesStack: INamedLoopIndexesStack;

  addProcess(target: Function, thisArgument: object | undefined, argumentList: any[], loopContext?: ILoopContext): void;
  retrieveAllProcesses(): IProcess[];

  addUpdatedStateProperty(accessor: IStatePropertyAccessor): void;
  retrieveAllUpdatedStateProperties(): IStatePropertyAccessor[];

  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: IBinding, callback:(updater: IUpdater)=>any): void;

  readonly isFullRebuild: boolean;
  setFullRebuild(isFullRebuild:boolean, callback:()=>any): void;
}

export type UpdateInfo = { name:string, indexes:number[] }
  