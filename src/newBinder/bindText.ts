import { getByUUID } from "../component/Template";
import { utils } from "../utils";
import { NodeType } from "./nodeType";

const BIND_DATASET = "bind";

type BindTextFn = (node:Node)=>string;

/** get text to bind from data-bind attribute */
const getBindTextFromHTMLElement:BindTextFn = (node:Node) => (node as HTMLElement).dataset[BIND_DATASET] ?? "";
/** get text to bind from data-bind attribute */
const getBindTextFromSVGElement:BindTextFn = (node:Node) => (node as HTMLElement).dataset[BIND_DATASET] ?? "";
/** get text to bind from textContent property */
const getBindTextFromText:BindTextFn = (node:Node) => node.textContent?.slice(3) ?? "";
/** get text to bind from template's data-bind attribute, looking up by textContent property */
const getBindTextFromTemplate:BindTextFn = (node:Node) => getByUUID(node.textContent?.slice(3) ?? "")?.dataset[BIND_DATASET] ?? "";
/** get text to bind from unknown node */
const getBindTextFromUnknown:BindTextFn = (node:Node) => (utils.raise(`Unknown NodeType: ${node.nodeType}`), "");

type BindTextByNodeType = {[key in NodeType]:BindTextFn};

const bindTextByNodeType:BindTextByNodeType = {
  [NodeType.HTMLElement]: getBindTextFromHTMLElement,
  [NodeType.SVGElement]:  getBindTextFromSVGElement,
  [NodeType.Text]:        getBindTextFromText,
  [NodeType.Template]:    getBindTextFromTemplate,
  [NodeType.Unknown]:     getBindTextFromUnknown,
}

export const getBindText = (node:Node, nodeType:NodeType):string => bindTextByNodeType[nodeType](node);