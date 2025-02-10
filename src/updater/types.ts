
import { IComponent, IProcess } from "../component/types";
import { IBinding } from "../binding/types";
import { ILoopContext, ILoopContextStack, INamedLoopIndexesStack } from "../loopContext/types";
import { IStatePropertyAccessor } from "../state/types";

//export type IComponentForUpdater = Pick<IComponent, "quelState" | "quelBindingSummary" | "quelTemplate" | "quelInitialPromises">;

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
  component: IComponent;
  debugStacks: string[];
  start(initialPromises: PromiseWithResolvers<void>): void;
  terminate(): Promise<void>;
}

export type UpdateInfo = { name:string, indexes:number[] }
  