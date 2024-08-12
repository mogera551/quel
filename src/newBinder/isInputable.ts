import { NodeType } from "../@types/binder";

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 */
const isInputableHTMLElement = (node:Node) => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));

const alwaysFalse = (node:Node) => false;

type IsInputableFn = {
  [key in NodeType]: (node:Node)=>boolean;
}

const isInputableFn:IsInputableFn = {
  HTMLElement: isInputableHTMLElement,
  SVGElement:  alwaysFalse,
  Text:        alwaysFalse,
  Template:    alwaysFalse,
}

export const getIsInputable = (node:Node, nodeType:NodeType):boolean => isInputableFn[nodeType](node);