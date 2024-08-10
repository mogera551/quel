
export interface IFilterInfo {
  name: string;
  options: string[];
}

export enum FilterType {
  Input,
  Output,
  Event
}

export type FilterFunc = (options:any[])=>(value:any)=>any;
export type FilterFuncWithOption = (options:any[])=>FilterFunc;
export type EventFilterFunc = (event:Event)=>Event;
export type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;

export type FilterFuncType<T = FilterType> = 
  T extends FilterType.Input ? FilterFunc : 
  T extends FilterType.Output ? FilterFunc : 
  T extends FilterType.Event ? EventFilterFunc : never;

export type FilterFuncWithOptionType<T = FilterType> = 
  T extends FilterType.Input ? FilterFuncWithOption :
  T extends FilterType.Output ? FilterFuncWithOption :
  T extends FilterType.Event ? EventFilterFuncWithOption : never;

export interface IFilterManager<T = FilterType> {
  ambigousNames:Set<string>;
  funcByName:(Map<string, FilterFuncWithOptionType<T>>);
  registerFilter(funcName:string, filterFunc:FilterFuncWithOptionType<T>):void;
  getFilterFunc(name:string):FilterFuncWithOptionType<T>;
}

export type IFilterManagerType<T = FilterType> =
  T extends FilterType.Input ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends FilterType.Output ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends FilterType.Event ? IFilterManager<EventFilterFuncWithOption> : never;
