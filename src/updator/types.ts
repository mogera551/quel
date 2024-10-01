
import { IProcess } from "../component/types";
import { IPropertyAccess } from "../binding/types";
import { IBinding, IBindingSummary } from "../binding/types";
import { IStates } from "../state/types";
import { Indexes } from "../dotNotation/types";
import { ILoopContext } from "../loopContext/types";

export interface IUpdator {
  executing: boolean;
  namedLoopIndexes: {[key: string]: number[]}; 
  loopContext: ILoopContext | undefined;
  setLoopContext(loopContext: ILoopContext | undefined, callback: () => Promise<void>): Promise<void>;
  setLoopIndexes(name: string, indexes: number[], callback: () => Promise<void>): Promise<void>;

  addProcess(target: Function, thisArgument: object | undefined, argumentList: any[], loopContext?: ILoopContext): void;
  retrieveAllProcesses(): IProcess[];

  addUpdatedStateProperty(prop: IPropertyAccess): void;
  retrieveAllUpdatedStateProperties(): IPropertyAccess[];

  exec(): Promise<void>;
  applyNodeUpdatesByBinding(binding: IBinding, callback:(updator: IUpdator)=>any): void;

  readonly isFullRebuild: boolean;
  setFullRebuild(isFullRebuild:boolean, callback:()=>any): void;
}

export type UpdateInfo = { name:string, indexes:number[] }
  