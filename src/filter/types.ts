
export interface IFilterInfo {
  name: string;
  options: string[];
}

export type FilterFunc = (options:any[])=>(value:any)=>any;
export type FilterFuncWithOption = (options:any[])=>FilterFunc;
export type EventFilterFunc = (event:Event)=>Event;
export type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;

export interface IFilterManager {
  ambigousNames:Set<string>;
  funcByName:(Map<string, FilterFuncWithOption>|Map<string, EventFilterFuncWithOption>);
  registerFilter(funcName:string, filterFunc:FilterFuncWithOption|EventFilterFuncWithOption):void;
  getFilterFunc(name:string):FilterFuncWithOption|EventFilterFuncWithOption;
}
