
import { GetDirectSymbol, SetDirectSymbol } from "../@symbols/dotNotation";
import "../nop";

type PropType = "primitive" | "object" | "array";
type ArrayIncompleteType = "none" | "parital" | "all";

export interface IPropInfo {
  name: string; // The original name
//  type: PropType; // The type of the property
//  incompleteType: ArrayIncompleteType; // The type of the array
  pattern:string; // The pattern 
  elements: string[];
  patternElements: string[];
  paths: string[];
  patternPaths: string[];
  wildcardPaths: string[];
  wildcardCount: number;
  wildcardIndexes: (number|undefined)[];
  lastIncompleteWildcardIndex: number;
}

export interface IDotNotationHandler {
  [GetDirectSymbol]:(prop:string, indexes:number[])=>any;
  [SetDirectSymbol]:(prop:string, indexes:number[], value:any)=>boolean;
  $1:number;
  $2:number;
  $3:number;
  $4:number;
  $5:number;
  $6:number;
  $7:number;
  $8:number;
  $9:number;
  $10:number;
  $11:number;
  $12:number;
  $13:number;
  $14:number;
  $15:number;
  $16:number;
  [key:string]:any;
}