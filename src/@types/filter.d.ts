import "../nop";

interface IFilterInfo {
  name: string;
  options: string[];
}

type FilterType = "input" | "output" | "event";

type FilterFunc = (options:any[])=>(value:any)=>any;
type FilterFuncWithOption = (options:any[])=>FilterFunc;
type EventFilterFunc = (event:Event)=>Event;
type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;

type FilterFuncType<T = FilterType> = 
  T extends "input" ? FilterFunc : 
  T extends "output" ? FilterFunc : 
  T extends "event" ? EventFilterFunc : never;

type FilterFuncWithOptionType<T = FilterType> = 
  T extends "input" ? FilterFuncWithOption :
  T extends "output" ? FilterFuncWithOption :
  T extends "event" ? EventFilterFuncWithOption : never;

interface IFilterManager<T = FilterType> {
  ambigousNames:Set<string>;
  funcByName:(Map<string, FilterFuncWithOptionType<T>>);
  registerFilter(funcName:string, filterFunc:FilterFuncWithOptionType<T>):void;
  getFilterFunc(name:string):FilterFuncWithOptionType<T>;
}

type IFilterManagerType<T = FilterType> =
  T extends "input" ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends "output" ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends "event" ? IFilterManager<EventFilterFuncWithOption> : never;
