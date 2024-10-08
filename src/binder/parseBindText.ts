import { IFilterText } from "../filter/types";
import { ParsedBindText } from "./types";

const SAMENAME = "@";
const DEFAULT = "$";

const trim = (s:string):string => s.trim();

const has = (s:string):boolean => s.length > 0; // check length

const re = new RegExp(/^#(.*)#$/);
const decode = (s:string):string => {
  const m = re.exec(s);
  return m ? decodeURIComponent(m[1]) : s;
};

/**
 * parse filter part
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 */
const parseFilter = (text:string):IFilterText => {
  const [name, ...options] = text.split(",").map(trim);
  return {name, options:options.map(decode)};
};

type ReturnParseStateProperty = {property:string,filters:IFilterText[]};
/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 */
const parseProperty = (text:string):ReturnParseStateProperty => {
  const [property, ...filterTexts] = text.split("|").map(trim);
  return {property, filters:filterTexts.map(parseFilter)};
};

/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 */
const parseExpression = (expr:string, defaultName:string):ParsedBindText => {
  const [nodePropertyText, statePropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { property:nodeProperty, filters:inputFilters } = parseProperty(nodePropertyText);
  const { property:stateProperty, filters:outputFilters } = parseProperty(statePropertyText);
  return { nodeProperty, stateProperty, inputFilters, outputFilters };
};

/**
 * parse bind text and return BindText[]
 */
const parseExpressions = (text:string, defaultName:string):ParsedBindText[] => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, stateProperty, inputFilters, outputFilters } = parseExpression(s, DEFAULT);
    stateProperty = stateProperty === SAMENAME ? nodeProperty : stateProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    return { nodeProperty, stateProperty, inputFilters, outputFilters };
  });
};

type BindTextsByKey = {[key:string]:ParsedBindText[]};

const _cache:BindTextsByKey = {};

/**
 * 取得したバインドテキスト(getBindTextByNodeType)を解析して、バインド情報を取得する
 * @param text バインドテキスト
 * @param defaultName デフォルト名
 * @returns {ParsedBindText[]} バインド情報
 */
export function parseBindText(
  text: string, 
  defaultName: string
): ParsedBindText[] {
  if (text.trim() === "") return [];
  const key:string = text + "\t" + defaultName;
  return _cache[key] ?? (_cache[key] = parseExpressions(text, defaultName));
}
