import { IBinding, IBindingManager } from "./binding";

export interface ILoopContext {
  bindingManager:IBindingManager;
  parentBindingManager:(IBindingManager|undefined);
  binding:(IBinding|undefined);
  nearestBindingManager:(IBindingManager|undefined);
  nearestLoopContext:(ILoopContext|undefined);
  _index:(number|undefined);
  index:(number|undefined);
  name:string;
  indexes:number[];
  allIndexes:number[];
  find(name:string):(ILoopContext|undefined);
}