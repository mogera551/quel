
export interface IFilterInfo {
  name: string;
  options: string[];
}

export type FilterFunc = (options:any[])=>(value:any)=>any;
export type FilterFuncWithOption = (options:any[])=>FilterFunc;
export type EventFilterFunc = (event:Event)=>Event;
export type EventFilterFuncWithOption = (options:string[])=>EventFilterFunc;
