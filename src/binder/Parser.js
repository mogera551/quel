import { Filter } from "../filter/Filter.js";

const SAMENAME = "@";
const DEFAULT = "$";

export class BindTextInfo {
  /**
   * @type {string}
   */
  nodeProperty;
  /**
   * @type {string}
   */
  viewModelProperty;
  /**
   * @type {Filter[]}
   */
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

/**
 * フィルターのパース
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 * @param {string} text 
 * @returns {Filter}
 */
const parseFilter = text => {
  const [name, ...options] = text.split(",").map(trim);
  return Object.assign(new Filter, {name, options});
};

/**
 * ViewModelプロパティのパース
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 * @param {string} text 
 * @returns {{viewModelProperty:string,filters:Filter[]}}
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
 * @returns {{nodeProperty:string,viewModelProp:string,filters:Filter[]}}
 */
const parseExpression = (expr, defaultName) => {
  const [nodeProperty, viewModelPropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
  const { viewModelProperty, filters } = parseViewModelProperty(viewModelPropertyText);
  return { nodeProperty, viewModelProperty, filters };
};

/**
 * 属性値のパース
 * @param {string} text 属性値
 * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
 * @returns {{prop:string,viewModelProp:string,filters:Filter[]}[]}
 */
const parseBindText = (text, defaultName) => {
  return text.split(";").map(trim).filter(has).map(s => { 
    let { nodeProperty, viewModelProperty, filters } = parseExpression(s, DEFAULT);
    viewModelProperty = viewModelProperty === SAMENAME ? nodeProperty : viewModelProperty;
    nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
    return { nodeProperty, viewModelProperty, filters };
  });
};

/**
 * data-bind属性をパースする関数群
 */
export class Parser {
  /**
   * @type {Map<string,BindTextInfo[]>}
   */
  static bindTextsByKey = new Map();

  /**
   * 属性値のパース
   * @param {string} text 属性値
   * @param {string} defaultName prop:を省略時、デフォルトのプロパティ値
   * @returns {BindTextInfo[]}
   */
  static parse(text, defaultName) {
    const key = text + "\t" + defaultName;
    let binds = this.bindTextsByKey.get(key);
    if (typeof binds === "undefined") {
      binds = parseBindText(text, defaultName).map(bind => Object.assign(new BindTextInfo, bind));
      this.bindTextsByKey.set(key, binds);
    }
    return binds;
  }
}