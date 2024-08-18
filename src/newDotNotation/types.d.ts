
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
}