export interface ILoopContext {
  readonly parentLoopContext?: ILoopContext;
  readonly index: number;
  readonly indexes: number[];
  readonly patternName:string;
  find(patternName:string):ILoopContext | undefined;
}