import { ILoopContext } from "../loopContext/types";
import { BindPropertySymbol, CheckDuplicateSymbol, ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";

export type IPropBuffer = {[key: string]: any};

export interface IProps {
  [key: string]: any;
  [BindPropertySymbol](parentProp: string, thisProp: string, loopContext:()=>ILoopContext | undefined): void;
  [SetBufferSymbol](buffer: IPropBuffer): void;
  [GetBufferSymbol](): IPropBuffer;
  [ClearBufferSymbol](): void;
  [CreateBufferSymbol](): IPropBuffer;
  [FlushBufferSymbol](): void;
  [CheckDuplicateSymbol](parentProp: string, thisProp: string): boolean;
}

export interface IPropsBindingInfo {
  readonly parentProp: string;
  readonly thisProp: string;
  readonly key: string;
}