import { utils } from "../utils";
import { NodeType } from "./types";

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 */
const isInputableHTMLElement = (node:Node) => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));

const alwaysFalse = (node:Node) => false;

const raiseError = (node:Node) => (utils.raise(`Unknown NodeType: ${node.constructor.name}`), false);

type IsInputableFn = {
  [key in NodeType]: (node:Node)=>boolean;
}

const isInputableFn = {
  [NodeType.HTMLElement]: isInputableHTMLElement,
  [NodeType.SVGElement]:  alwaysFalse,
  [NodeType.Text]:        alwaysFalse,
  [NodeType.Template]:    alwaysFalse,
  [NodeType.Unknown]:     raiseError,
}

export const getIsInputable = (node:Node, nodeType:NodeType):boolean => isInputableFn[nodeType](node);