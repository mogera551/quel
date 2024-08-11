export const _ = foo;

interface IFilterInfo {
  name: string;
  options: string[];
}

enum FilterType {
  Input,
  Output,
  Event
}

type FilterFunc = (options:any[])=>(value:any)=>any;
type FilterFuncWithOption = (options:any[])=>FilterFunc;
type EventFilterFunc = (event:Event)=>Event;
type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;

type FilterFuncType<T = FilterType> = 
  T extends FilterType.Input ? FilterFunc : 
  T extends FilterType.Output ? FilterFunc : 
  T extends FilterType.Event ? EventFilterFunc : never;

type FilterFuncWithOptionType<T = FilterType> = 
  T extends FilterType.Input ? FilterFuncWithOption :
  T extends FilterType.Output ? FilterFuncWithOption :
  T extends FilterType.Event ? EventFilterFuncWithOption : never;

interface IFilterManager<T = FilterType> {
  ambigousNames:Set<string>;
  funcByName:(Map<string, FilterFuncWithOptionType<T>>);
  registerFilter(funcName:string, filterFunc:FilterFuncWithOptionType<T>):void;
  getFilterFunc(name:string):FilterFuncWithOptionType<T>;
}

type IFilterManagerType<T = FilterType> =
  T extends FilterType.Input ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends FilterType.Output ? IFilterManager<FilterFuncWithOptionType<T>> :
  T extends FilterType.Event ? IFilterManager<EventFilterFuncWithOption> : never;
