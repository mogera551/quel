import { ILoopIndexes, INamedLoopIndexes } from "../loopContext/types";

export interface IPatternInfo {
  /** 
   * ex. aaa.\*.bbb.\*.ccc => ["aaa", "\*", "bbb", "\*", "ccc"]
   */
  readonly patternElements: string[];
  /** 
   * ex. aaa.\*.bbb.\*.ccc => [
   *   "aaa",
   *   "aaa.\*",
   *   "aaa.\*.bbb",
   *   "aaa.\*.bbb.\*",
   *   "aaa.\*.bbb.\*.ccc"
   * ]
   */
  readonly patternPaths: string[];
  /**
   * ex. aaa.\*.bbb.\*.ccc => [
   *   "aaa.\*",
   *   "aaa.\*.bbb.\*"
   * ]
   */
  readonly wildcardPaths: string[];
}

export type WildcardType = "none" | "context" | "partial" | "all";

export interface IPropInfo extends IPatternInfo {
  /**
   * ex. aaa.0.bbb.2.ccc => aaa.0.bbb.2.ccc
   */
  readonly name: string; // The original name
  readonly expandable: boolean,
  /**
   * ex. aaa.0.bbb.2.ccc => aaa.*.bbb.*.ccc
   */
  readonly pattern: string; // The pattern 
  /** 
   * ex. aaa.0.bbb.2.ccc => ["aaa", "0", "bbb", "2", "ccc"]
   */
  readonly elements: string[];
  /** 
   * ex. aaa.0.bbb.2.ccc => [
   *   "aaa",
   *   "aaa.0",
   *   "aaa.0.bbb",
   *   "aaa.0.bbb.2",
   *   "aaa.0.bbb.2.ccc"
   * ]
   */
  readonly paths: string[];
  readonly wildcardLoopIndexes: ILoopIndexes | undefined,
  readonly wildcardNamedLoopIndexes: INamedLoopIndexes;
  readonly wildcardCount: number;
  readonly wildcardType: WildcardType;
}

export type Index = number | undefined;
export type Indexes = (undefined|number)[];
