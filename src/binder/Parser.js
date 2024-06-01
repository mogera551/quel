import { utils } from "../utils.js";

const SAMENAME = "@";
const DEFAULT = "$";

export class BindTextInfo {
  /** @type {string} bindするnodeのプロパティ名 */
  nodeProperty;
  /** @type {string} bindするviewModelのプロパティ名 */
  viewModelProperty;
  /** @type {FilterInfo[]} 適用するフィルターの配列 */
  filters;
}

/**
 * トリム関数
 * @param {string} s 
 * @returns {string}
 */
const trim = s => s.trim();

/**
 * 長さチェック関数
 * @param {string} s 
 * @returns {string}
 */
const has = s => s.length > 0;

const decode = s => decodeURIComponent(s);

/**
 * フィルターのパース
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 * @param {string} text 
 * @returns {FilterInfo}
 */
const parseFilter = text => {
  const [name, ...options] = text.split(",").map(trim);
  return {name, options:options.map(decode)};
};

/**
 * ViewModelプロパティのパース
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 * @param {string} text 
 * @returns {{viewModelProperty:string,filters:FilterInfo[]}}
 */
const parseViewModelProperty = text => {
  const [viewModelProperty, ...filterTexts] = text.split("|").map(trim);
  return {viewModelProperty, filters:filterTexts.map(text => parseFilter(text))};
};

/**
 * 式のパース
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
 * data-bind属性値のパース
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
 * data-bind属性値のパースし、BindTextInfoの配列を返す
 * @param {string} text data-bind属性値
 * @param {string｜undefined} defaultName prop:を省略時に使用する、プロパティの名前
 * @returns {BindTextInfo[]}
 */
export function parse(text, defaultName) {
  (typeof text === "undefined") && utils.raise("Parser: text is undefined");
  if (text.trim() === "") return [];
  /** @type {string} */
  const key = text + "\t" + defaultName;
  /** @type {BindTextInfo[] | undefined} */
  let binds = bindTextsByKey[key];

  if (typeof binds === "undefined") {
    binds = parseBindText(text, defaultName).map(bind => Object.assign(new BindTextInfo, bind));
    bindTextsByKey[key] = binds;
  }
  return binds;
}
