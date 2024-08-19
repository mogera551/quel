import { Handler as DotNotationHandler } from "../newDotNotation/Handler";
import { IBaseState } from "./types";

/**
 * ステートを扱うためのベースハンドラ
 * 
 */
export class Handler extends DotNotationHandler implements ProxyHandler<IBaseState> {

}