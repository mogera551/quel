import { AccessorPropertiesSymbol, ClearCacheApiSymbol, CreateBufferApiSymbol, DependenciesSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "../@symbols/state";
import { IComponent, IUpdator } from "./component";
import { IDotNotationHandler, IDotNotationProxy } from "./dotNotation";
import { IGlobalDataProxy } from "./global";
import { ILoopContext } from "./loopContext";

interface IStateHandler {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
  readonly element: HTMLElement;
  readonly updator: IUpdator;
//  addNotify(state:Object, prop:PropertyAccess, stateProxy:IStateProxy):void;
  clearCache():void;
  directlyCallback(loopContext: ILoopContext | undefined, callback: () => Promise<void>): Promise<void>;
//  addProcess(process:() => Promise<void>, stateProxy:IStateProxy, indexes:number[]):void;
}

interface IBaseState  {
  readonly $dependentProps: Dependencies;
}

interface IStateProxy extends IDotNotationProxy, IBaseState {
  readonly [AccessorPropertiesSymbol]: Set<string>;
  readonly [DependenciesSymbol]: IDependentProps;
  // API
  [DirectryCallApiSymbol](prop: string, loopContext: ILoopContext | undefined, event: Event): Promise<void>;
  [NotifyForDependentPropsApiSymbol](prop:string, indexes:number[]): void;
  [GetDependentPropsApiSymbol](): IDependentProps;
  [ClearCacheApiSymbol](): void;
  [CreateBufferApiSymbol](component:IComponent): void;
  [FlushBufferApiSymbol](buffer:{[key:string]:any}, component:IComponent): boolean;
  // Special Property
  readonly $globals: IGlobalDataProxy;
  readonly $component: IComponent; // todo:後でIUserComponentに変更する
}

type Dependencies = {
  readonly [key:string]: string[]
}

interface IDependentProps {
  readonly propsByRefProp: {[ key: string ]: Set<string>};
  setDefaultProp(prop:string):void;
}

type StateInfo = {
  readonly accessorProperties: Set<string>;
  readonly dependentProps: IDependentProps;
}

interface IStates {
  readonly base: Object;
  readonly current: IStateProxy;
  writable(callback: () => Promise<void>): Promise<void>;
}
