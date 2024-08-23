import { utils } from "../utils.js";
import { IFilterInfo } from "../@types/filter.js";
import { ParseBindTextInfo } from "./types.js";

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
const parseFilter = (text:string):IFilterInfo => {
  const [name, ...options] = text.split(",").map(trim);
  return {name, options:options.map(decode)};
};

type ReturnParseStateProperty = {stateProperty:string,filters:IFilterInfo[]};
/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 */
const parseStateProperty = (text:string):ReturnParseStateProperty => {
  const [stateProperty, ...filterTexts] = text.split("|").map(trim);
  return {stateProperty, filters:filterTexts.map(parseFilter)};
};

/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 */
const parseExpression = (expr:string, defaultName:string):ParseBindTextInfo => {
  const [nodeProperty, statePropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { stateProperty, filters } = parseStateProperty(statePropertyText);
  return { nodeProperty, stateProperty, filters };
};

/**
 * parse bind text and return BindTextInfo[]
 */
const parseBindText = (text:string, defaultName:string):ParseBindTextInfo[] => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, stateProperty, filters } = parseExpression(s, DEFAULT);
    stateProperty = stateProperty === SAMENAME ? nodeProperty : stateProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    typeof nodeProperty === "undefined" && utils.raise("parseBindText: default property undefined");
    return { nodeProperty, stateProperty, filters };
  });
};

type BindTextsByKey = {[key:string]:ParseBindTextInfo[]};

const _cache:BindTextsByKey = {};

/**
 * parse bind text and return BindTextInfo[], if hit cache return cache value
 */
export function parse(text:string, defaultName:string):ParseBindTextInfo[] {
  if (text.trim() === "") return [];
  const key:string = text + "\t" + defaultName;
  return _cache[key] ?? (_cache[key] = parseBindText(text, defaultName));
}
