import { GetNamedLoopIndexesStackFn } from "../dotNotation/types";
import { INamedLoopIndexesStack } from "../loopContext/types";
import { IStateHandler } from "./types";

type IHandlerPartialGetNamedLoopIndexesStack = Pick<IStateHandler, "updator">;

export function getNamedLoopIndexesStackFn(handler: IHandlerPartialGetNamedLoopIndexesStack): GetNamedLoopIndexesStackFn {
  return function (): INamedLoopIndexesStack {
    return handler.updator.namedLoopIndexesStack;
  };
}