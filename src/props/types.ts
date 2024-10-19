import { ILoopContext } from "../loopContext/types";
import { BindPropertySymbol, ClearBufferSymbol, CreateBufferSymbol, FlushBufferSymbol, GetBufferSymbol, SetBufferSymbol } from "./symbols";

export type IPropBuffer = {[key: string]: any};

export interface IProps {
  [key: string]: any;
  [BindPropertySymbol](parentProp: string, thisProp: string, loopContext:ILoopContext | undefined): void;
  [SetBufferSymbol](buffer: IPropBuffer): void;
  [GetBufferSymbol](): IPropBuffer;
  [ClearBufferSymbol](): void;
  [CreateBufferSymbol](): IPropBuffer;
  [FlushBufferSymbol](): void;
}