import { utils } from "../utils.js";

const SAMENAME = "@";
const DEFAULT = "$";


/**
 * trim
 * @param {string} s 
 * @returns {string}
 */
const trim = s => s.trim();

/**
 * check length
 * @param {string} s 
 * @returns {string}
 */
const has = s => s.length > 0;

const re = new RegExp(/^#(.*)#$/);
const decode = s => {
  const m = re.exec(s);
  return m ? decodeURIComponent(m[1]) : s;
};

/**
 * parse filter part
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 * @param {string} text 
 * @returns {FilterInfo}
 */
const parseFilter = text => {
  const [name, ...options] = text.split(",").map(trim);
  return {name, options:options.map(decode)};
};

/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 * @param {string} text 
 * @returns {{viewModelProperty:string,filters:FilterInfo[]}}
 */
const parseViewModelProperty = text => {
  const [viewModelProperty, ...filterTexts] = text.split("|").map(trim);
  return {viewModelProperty, filters:filterTexts.map(parseFilter)};
};

/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 * @param {string} expr 
 * @param {string} defaultName 
 * @returns {BindTextInfo}
 */
const parseExpression = (expr, defaultName) => {
  const [nodeProperty, viewModelPropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { viewModelProperty, filters } = parseViewModelProperty(viewModelPropertyText);
  return { nodeProperty, viewModelProperty, filters };
};

/**
 * parse bind text and return BindTextInfo[]
 * @param {string} text data-bind属性値
 * @param {string|undefined} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {BindTextInfo[]}
 */
const parseBindText = (text, defaultName) => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, viewModelProperty, filters } = parseExpression(s, DEFAULT);
    viewModelProperty = viewModelProperty === SAMENAME ? nodeProperty : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    typeof nodeProperty === "undefined" && utils.raise("parseBindText: default property undefined");
    return { nodeProperty, viewModelProperty, filters };
  });
};

/** @type {Object<string,BindTextInfo[]>} */
const bindTextsByKey = {};

/**
 * parse bind text and return BindTextInfo[], if hit cache return cache value
 * @param {string} text data-bind属性値
 * @param {string｜undefined} defaultName prop:を省略時に使用する、プロパティの名前
 * @returns {BindTextInfo[]}
 */
export function parse(text, defaultName) {
  (typeof text === "undefined") && utils.raise("Parser: text is undefined");
  if (text.trim() === "") return [];
  /** @type {string} */
  const key = text + "\t" + defaultName;

  return bindTextsByKey[key] ?? (bindTextsByKey[key] = parseBindText(text, defaultName));
}
