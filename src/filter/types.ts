export interface IFilterText {
  name: string;
  options: string[];
}

export type FilterType = "input" | "output" | "event";

export type FilterFunc = (options:any[])=>(value:any)=>any;
export type FilterFuncWithOption = (options:any[])=>FilterFunc;
export type EventFilterFunc = (event:Event)=>Event;
export type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;

export type FilterFuncType<T = FilterType> = 
  T extends "input" ? FilterFunc : 
  T extends "output" ? FilterFunc : 
  T extends "event" ? EventFilterFunc : never;

export type FilterFuncWithOptionType<T = FilterType> = 
  T extends "input" ? FilterFuncWithOption :
  T extends "output" ? FilterFuncWithOption :
  T extends "event" ? EventFilterFuncWithOption : never;

export interface IFilterManager<T = FilterType> {
  ambigousNames:Set<string>;
  funcByName:(Map<string, FilterFuncWithOptionType<T>>);
  registerFilter(funcName:string, filterFunc:FilterFuncWithOptionType<T>):void;
  getFilterFunc(name:string):FilterFuncWithOptionType<T>;
}

export type IFilterManagerType<T = FilterType> =
  T extends "input" ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends "output" ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends "event" ? IFilterManager<EventFilterFuncWithOption> : never;
