import { GetDirectSymbol, SetDirectSymbol } from "../dot-notation/Const";

export type StateClass = typeof Object;

export type State = {
  [key:PropertyKey]:any,
  [GetDirectSymbol]:(patternName:string, indexes:number[]) => any,
  [SetDirectSymbol]:(patternName:string, indexes:number[], value:any) => boolean
};

export type Proxies = {
  base:State, write:State, readonly:State
}
