import { NodeType } from "./types";

const DEFAULT_PROPERTY = "textContent";

type DefaultPropertyByElementType = {
  [key:string]: string;
}

const defaultPropertyByElementType:DefaultPropertyByElementType = {
  "radio": "checked",
  "checkbox": "checked",
  "button": "onclick",
}

/**
 * HTML要素のデフォルトプロパティを取得
 */
const getDefaultPropertyHTMLElement = (node:Node):string => 
  node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement ? "value" : 
  node instanceof HTMLButtonElement ? "onclick" : 
  node instanceof HTMLAnchorElement ? "onclick" : 
  node instanceof HTMLFormElement ? "onsubmit" : 
  node instanceof HTMLInputElement ? (defaultPropertyByElementType[node.type] ?? "value") :
  DEFAULT_PROPERTY;

type DefaultPropertyByKey = {
  [key:string]: string | undefined;
}

const _cache: DefaultPropertyByKey = {};

const undefinedProperty = (node:Node):(string|undefined) => undefined;
const textContentProperty = (node:Node):(string|undefined) => DEFAULT_PROPERTY;

type GetDefaultPropertyByNodeType = {
  [key in NodeType]: (node:Node)=>(string|undefined);
}

const getDefaultPropertyByNodeType:GetDefaultPropertyByNodeType = {
  HTMLElement: getDefaultPropertyHTMLElement,
  SVGElement:  undefinedProperty,
  Text:        textContentProperty,
  Template:    undefinedProperty,
}

/**
 * get html element's default property
 */
export const getDefaultProperty = (node:Node, nodeType:NodeType):(string|undefined) => {
  const key = node.constructor.name + "\t" + ((node as HTMLInputElement).type ?? ""); // type attribute
  return _cache[key] ?? (_cache[key] = getDefaultPropertyByNodeType[nodeType](node));
}
  