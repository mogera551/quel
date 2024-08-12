const config = {
    debug: false, // debug mode
    useShadowRoot: false, // use shadowroot
    useKeyed: true, // use keyed
    useWebComponent: true, // use web component
    useLocalTagName: true, // use local tag name
    useLocalSelector: true, // use local selector
    useOverscrollBehavior: true, // use overscroll-behavior
};

function getCustomTagFromImportMeta(importMeta) {
    const url = new URL(importMeta.url);
    const tagName = url.search.slice(1);
    return tagName;
}
async function importHtmlFromImportMeta(importMeta) {
    return await fetch(importMeta.url.replace(".js", ".html")).then(response => response.text());
}
async function importCssFromImportMeta(importMeta) {
    return await fetch(importMeta.url.replace(".js", ".css")).then(response => response.text());
}

const DEFAULT_NAME_TYPE = "lowerCamel";
const DEAFULT_PATH = "./";
class Config {
    /**
     * ファイル名に使用するデフォルトの名前の形式（kebab,snake,upperCamel,lowerCamel,dotted）
     */
    defaultNameType = DEFAULT_NAME_TYPE;
    /**
     * プレフィックスに一致しない場合のパス名、undefinedの場合、ロードせずエラーとする
     */
    defaultPath = DEAFULT_PATH;
    /**
     * ロードする名前の一覧
     */
    loadNames = [];
    /**
     * プレフィックスのマップ、キー：名前、値：パス
     */
    prefixMap;
}

class Prefix {
    prefix;
    path;
    get matchPrefix() {
        return `${this.prefix}-`;
    }
    constructor(prefix, path) {
        this.prefix = prefix;
        this.path = path;
    }
    isMatch(name) {
        return name.startsWith(this.matchPrefix);
    }
    getNames(kebabCaseName) {
        const { prefix, path } = this;
        if (kebabCaseName.startsWith(this.matchPrefix)) {
            const subName = kebabCaseName.slice(this.matchPrefix.length);
            return { prefixName: prefix, subName, path };
        }
        return;
    }
}

const toKebabCase = (text) => (typeof text === "string") ? text.replaceAll(/[\._]/g, "-").replaceAll(/([A-Z])/g, (match, char, index) => (index > 0 ? "-" : "") + char.toLowerCase()) : text;

function getNameByCaseType(name) {
    const kebabName = toKebabCase(name);
    const snakeName = kebabName.replaceAll("-", "_");
    const dottedName = kebabName.replaceAll("-", ".");
    const upperCamelName = kebabName.split("-").map((text, index) => {
        if (typeof text[0] !== "undefined") {
            text = text[0].toUpperCase() + text.slice(1);
        }
        return text;
    }).join("");
    const lowerCamelName = (upperCamelName.length > 0) ? upperCamelName[0].toLowerCase() + upperCamelName.slice(1) : upperCamelName;
    return {
        kebab: kebabName,
        snake: snakeName,
        upperCamel: upperCamelName,
        lowerCamel: lowerCamelName,
        dotted: dottedName,
    };
}

const REPLACE_PREFIX = "prefix-name";
const REPLACE_SUB = "sub-name";
const replacePrefixNames = getNameByCaseType(REPLACE_PREFIX);
const replaceSubNames = getNameByCaseType(REPLACE_SUB);
function getPathInfo(path, prefixName, subName, defaultNameType) {
    const [filePath, exportName] = path.split("#");
    let replaceFilePath = filePath;
    let replaceExportName = exportName;
    const prefixNames = getNameByCaseType(prefixName);
    const subNames = getNameByCaseType(subName);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["kebab"]}}`, prefixNames["kebab"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["snake"]}}`, prefixNames["snake"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["lowerCamel"]}}`, prefixNames["lowerCamel"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["upperCamel"]}}`, prefixNames["upperCamel"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replacePrefixNames["dotted"]}}`, prefixNames["dotted"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["kebab"]}}`, subNames["kebab"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["snake"]}}`, subNames["snake"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["lowerCamel"]}}`, subNames["lowerCamel"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["upperCamel"]}}`, subNames["upperCamel"]);
    replaceFilePath = replaceFilePath.replaceAll(`{${replaceSubNames["dotted"]}}`, subNames["dotted"]);
    if (filePath === replaceFilePath && replaceFilePath.slice(-3) !== ".js") {
        // 変換されなかった場合、パスにファイル名を付加する
        replaceFilePath = replaceFilePath + (path.slice(-1) !== "/" ? "/" : "") + subNames[defaultNameType] + ".js";
    }
    if (replaceExportName) {
        replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["kebab"]}}`, subNames["kebab"]);
        replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["snake"]}}`, subNames["snake"]);
        replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["lowerCamel"]}}`, subNames["lowerCamel"]);
        replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["upperCamel"]}}`, subNames["upperCamel"]);
        replaceExportName = replaceExportName.replaceAll(`{${replaceSubNames["dotted"]}}`, subNames["dotted"]);
    }
    return {
        filePath: replaceFilePath,
        exportName: replaceExportName
    };
}

class utils {
    static raise(message) {
        throw new Error(message);
    }
    /**
     * to kebab case (upper camel, lower camel, snakeを想定)
     */
    static toKebabCase = (text) => (typeof text === "string") ? text.replaceAll(/_/g, "-").replaceAll(/([A-Z])/g, (match, char, index) => (index > 0 ? "-" : "") + char.toLowerCase()) : text;
    static createUUID() {
        return window?.crypto?.randomUUID ? window.crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (a) {
                let r = (new Date().getTime() + Math.random() * 16) % 16 | 0, v = a == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }
}

class Loader {
    #configFile;
    #config;
    #prefixMap = new Map;
    #registrar;
    /**
     * @type {string}
     */
    #location;
    /**
     *
     * @param {RegistrarClass} registrar
     */
    constructor(registrar) {
        this.#registrar = registrar;
        this.#location = window.location;
        this.#config = Object.assign(new Config);
    }
    /**
     * configの設定
     */
    setConfig(config) {
        this.#config = Object.assign(new Config, config);
        if ("prefixMap" in config && typeof config.prefixMap !== "undefined") {
            this.setPrefixMap(config.prefixMap);
        }
    }
    /**
     * configの取得
     */
    getConfig() {
        return this.#config;
    }
    /**
     * prefixMapの設定
     */
    setPrefixMap(prefixMap) {
        this.#prefixMap = new Map(Object.entries(prefixMap).map(([prefix, path]) => {
            const kebabPrefix = toKebabCase(prefix);
            return [kebabPrefix, new Prefix(prefix, path)];
        }));
    }
    /**
     * prefixMapの取得
     */
    getPrefixMap() {
        return this.#prefixMap;
    }
    /**
     * configファイルの設定
     * メソッドチェーン
     * @param {string} configFile
     * @returns {Loader}
     */
    configFile(configFile) {
        this.#configFile = configFile;
        return this;
    }
    /**
     * configの設定
     * メソッドチェーン
     */
    config(config) {
        this.setConfig(config);
        return this;
    }
    /**
     * prefixMapの設定
     * メソッドチェーン
     */
    prefixMap(prefixMap) {
        this.setPrefixMap(prefixMap);
        return this;
    }
    get registrar() {
        return this.#registrar;
    }
    /**
     *
     */
    async loadConfig(configFile) {
        // コンフィグをファイルから読み込む
        const paths = this.#location.pathname.split("/");
        paths[paths.length - 1] = configFile;
        const fullPath = this.#location.origin + paths.join("/");
        try {
            const response = await fetch(fullPath);
            const config = await response.json();
            return Object.assign(new Config, config);
        }
        catch (e) {
            console.error(`config file load error (configFile:${configFile}, ${fullPath})`, e);
            throw new Error("config file load error");
        }
    }
    async load(...loadNames) {
        if (typeof this.#configFile !== "undefined") {
            const config = await this.loadConfig(this.#configFile);
            this.setConfig(config);
        }
        if (typeof this.#prefixMap === "undefined") {
            throw new Error(`prefixMap is not defined`);
        }
        if (typeof this.#registrar === "undefined") {
            throw new Error(`registrar is not defined`);
        }
        const prefixes = Array.from(this.#prefixMap.values());
        const { defaultNameType, defaultPath } = this.#config;
        loadNames = (loadNames.length > 0) ? loadNames : this.#config.loadNames;
        for (let loadName of loadNames) {
            loadName = toKebabCase(loadName);
            let loadPaths;
            const prefix = prefixes.find(prefix => prefix.isMatch(loadName));
            if (typeof prefix !== "undefined") {
                const names = prefix.getNames(loadName) ?? utils.raise(`names not found (loadName:${loadName})`);
                loadPaths = getPathInfo(names.path, names.prefixName, names.subName, defaultNameType);
            }
            if (typeof loadPaths === "undefined" && typeof defaultPath !== "undefined") {
                loadPaths = getPathInfo(defaultPath, "", loadName, defaultNameType);
            }
            if (typeof loadPaths === "undefined") {
                throw new Error(`unmatch prefix and no defaultPath (loadName:${loadName})`);
            }
            const paths = this.#location.pathname.split("/");
            paths[paths.length - 1] = loadPaths.filePath;
            const importPath = this.#location.origin + paths.join("/");
            let module;
            try {
                module = await import(importPath);
            }
            catch (e) {
                console.error(`import error (loadName:${loadName}, ${importPath})`, e);
                throw new Error("import error");
            }
            let moduleData;
            if (typeof loadPaths.exportName !== "undefined") {
                if (typeof module.default !== "undefined") {
                    if (loadPaths.exportName in module.default) {
                        moduleData = module.default[loadPaths.exportName];
                    }
                }
                else {
                    if (loadPaths.exportName in module) {
                        moduleData = module[loadPaths.exportName];
                    }
                }
                if (typeof moduleData === "undefined") {
                    throw new Error(`${loadPaths.exportName} not found in module (exportName:${loadPaths.exportName}, ${loadPaths.filePath})`);
                }
            }
            else {
                if (typeof module.default !== "undefined") {
                    moduleData = module.default;
                }
                else {
                    moduleData = Object.assign({}, module);
                }
            }
            this.#registrar(loadName, moduleData);
        }
        return this;
    }
    /**
     *
     */
    static create(registrar) {
        return new Loader(registrar);
    }
}

const DATASET_BIND_PROPERTY$1 = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";
const templateByUUID = new Map;
/**
 * HTMLの変換
 * {{loop:}}{{if:}}{{else:}}を<template>へ置換
 * {{end:}}を</template>へ置換
 * {{...}}を<!--@@:...-->へ置換
 * <template>を<!--@@|...-->へ置換
 */
function replaceTag(html, componentUuid, customComponentNames) {
    const stack = [];
    const replacedHtml = html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
        expr = expr.trim();
        if (expr.startsWith("loop:") || expr.startsWith("if:")) {
            stack.push(expr);
            return `<template data-bind="${expr}">`;
        }
        else if (expr.startsWith("else:")) {
            const saveExpr = stack.at(-1);
            if (typeof saveExpr === "undefined" || !saveExpr.startsWith("if:")) {
                utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
            }
            return `</template><template data-bind="${saveExpr}|not">`;
        }
        else if (expr.startsWith("end:")) {
            if (typeof stack.pop() === "undefined") {
                utils.raise(`Template: end: is not matched with loop: or if:, but {{ ${expr} }} `);
            }
            return `</template>`;
        }
        else if (expr.startsWith("endif:")) {
            const expr = stack.pop();
            if (typeof expr === "undefined" || !expr.startsWith("if:")) {
                utils.raise(`Template: endif: is not matched with if:, but {{ ${expr} }} `);
            }
            return `</template>`;
        }
        else if (expr.startsWith("endloop:")) {
            const expr = stack.pop();
            if (typeof expr === "undefined" || !expr.startsWith("loop:")) {
                utils.raise(`Template: endloop: is not matched with loop:, but {{ ${expr} }} `);
            }
            return `</template>`;
        }
        else {
            return `<!--@@:${expr}-->`;
        }
    });
    if (stack.length > 0) {
        utils.raise(`Template: loop: or if: is not matched with endloop: or endif:, but {{ ${stack.at(-1)} }} `);
    }
    const root = document.createElement("template"); // 仮のルート
    root.innerHTML = replacedHtml;
    // カスタムコンポーネントの名前を変更する
    const customComponentKebabNames = customComponentNames.map(customComponentName => utils.toKebabCase(customComponentName));
    const changeCustomElementName = (element) => {
        for (const customComponentKebabName of customComponentKebabNames) {
            const replaceElements = Array.from(element.querySelectorAll(customComponentKebabName));
            for (const oldElement of replaceElements) {
                const newElement = document.createElement(`${customComponentKebabName}-${componentUuid}`);
                for (let i = 0; i < oldElement.attributes.length; i++) {
                    const attr = oldElement.attributes[i];
                    newElement.setAttribute(attr.name, attr.value);
                }
                newElement.setAttribute("data-orig-tag-name", customComponentKebabName);
                oldElement.parentNode?.replaceChild(newElement, oldElement);
            }
            const changeIsElements = Array.from(element.querySelectorAll(`[is="${customComponentKebabName}"]`));
            for (const oldElement of changeIsElements) {
                const newElement = document.createElement(oldElement.tagName, { is: `${customComponentKebabName}-${componentUuid}` });
                for (let i = 0; i < oldElement.attributes.length; i++) {
                    const attr = oldElement.attributes[i];
                    if (attr.name === "is")
                        continue;
                    newElement.setAttribute(attr.name, attr.value);
                }
                newElement.setAttribute("data-orig-is", customComponentKebabName);
                oldElement.parentNode?.replaceChild(newElement, oldElement);
            }
        }
        const templates = Array.from(element.querySelectorAll("template"));
        for (const template of templates) {
            changeCustomElementName(template.content);
        }
    };
    if (customComponentKebabNames.length > 0) {
        changeCustomElementName(root.content);
    }
    // templateタグを一元管理(コメント<!--@@|...-->へ差し替える)
    const replaceTemplate = (element) => {
        let template;
        while (template = element.querySelector("template")) {
            const uuid = utils.createUUID();
            const comment = document.createComment(`@@|${uuid}`);
            template.parentNode?.replaceChild(comment, template);
            if (template.constructor !== HTMLTemplateElement) {
                // SVGタグ内のtemplateタグを想定
                const newTemplate = document.createElement("template");
                for (let childNode of Array.from(template.childNodes)) {
                    newTemplate.content.appendChild(childNode);
                }
                const bindText = template.getAttribute(DATASET_BIND_PROPERTY$1);
                if (bindText) {
                    newTemplate.setAttribute(DATASET_BIND_PROPERTY$1, bindText);
                }
                template = newTemplate;
            }
            template.setAttribute(DATASET_UUID_PROPERTY, uuid);
            replaceTemplate(template.content);
            templateByUUID.set(uuid, template);
        }
    };
    replaceTemplate(root.content);
    return root.innerHTML;
}
/**
 * UUIDからHTMLTemplateElementオブジェクトを取得(ループや分岐条件のブロック)
 */
function getByUUID(uuid) {
    return templateByUUID.get(uuid);
}
/**
 * htmlとcssの文字列からHTMLTemplateElementオブジェクトを生成
 */
function create$1(html, componentUuid, customComponentNames) {
    const template = document.createElement("template");
    template.innerHTML = replaceTag(html, componentUuid, customComponentNames);
    template.setAttribute(DATASET_UUID_PROPERTY, componentUuid);
    templateByUUID.set(componentUuid, template);
    return template;
}

const styleSheetByUuid = new Map;
// create style sheet by css text
function createStyleSheet$1(cssText) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    return styleSheet;
}
// get style sheet by uuid, if not found, create style sheet
function create(cssText, uuid) {
    const styleSheetFromMap = styleSheetByUuid.get(uuid);
    if (styleSheetFromMap)
        return styleSheetFromMap;
    const styleSheet = createStyleSheet$1(cssText);
    styleSheetByUuid.set(uuid, styleSheet);
    return styleSheet;
}
function localizeStyleSheet(styleSheet, localSelector) {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        const rule = styleSheet.cssRules[i];
        if (rule instanceof CSSStyleRule) {
            const newSelectorText = rule.selectorText.split(",").map(selector => {
                if (selector.trim().startsWith(":host")) {
                    return selector.replace(":host", localSelector);
                }
                return `${localSelector} ${selector}`;
            }).join(",");
            rule.selectorText = newSelectorText;
        }
    }
    return styleSheet;
}

class Module {
    #uuid = utils.createUUID();
    get uuid() {
        return this.#uuid;
    }
    html = "";
    css;
    get template() {
        const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
        return create$1(this.html, this.uuid, customComponentNames);
    }
    get styleSheet() {
        return this.css ? create(this.css, this.uuid) : undefined;
    }
    State = class {
    };
    config = {};
    moduleConfig = {};
    options = {};
    filters = {};
    componentModules;
    get componentModulesForRegister() {
        if (this.config.useLocalTagName ?? config.useLocalTagName) {
            // case of useLocalName with true,
            // subcompnents tag name convert to the name with uuid
            if (typeof this.componentModules !== "undefined") {
                const componentModules = {};
                for (const [customElementName, componentModule] of Object.entries(this.componentModules)) {
                    componentModules[`${utils.toKebabCase(customElementName)}-${this.uuid}`] = componentModule;
                }
                return componentModules;
            }
        }
        return this.componentModules;
    }
}

const objectFilterGroup = {
    objectClass: Object,
    prefix: "object",
    prefixShort: "o",
    prototypeFuncs: new Set([
        "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString",
        "toString", "valueOf",
    ]),
    staticFuncs: new Set([
        "create", "defineProperties", "defineProperty", "entries", "fromEntries",
        "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols",
        "getPrototypeOf", "is", "isExtensible", "isFrozen",
        "isSealed", "keys", "preventExtensions", "values",
    ]),
};
const arrayFilterGroup = {
    objectClass: Array,
    prefix: "array",
    prefixShort: "a",
    prototypeFuncs: new Set([
        "at", "concat", "entries", "flat",
        "includes", "indexOf", "join", "keys",
        "lastIndexOf", "slice", "toLocaleString", "toReversed",
        "toSorted", "toSpliced", "values", "with", "toString",
    ]),
    staticFuncs: new Set([
        "from", "isArray", "of"
    ]),
};
const numberFilterGroup = {
    objectClass: Number,
    prefix: "number",
    prefixShort: "n",
    prototypeFuncs: new Set([
        "toExponential", "toFixed", "toLocaleString", "toPrecision",
        "toString", "valueOf",
    ]),
    staticFuncs: new Set([
        "isFinite", "isInteger", "isNaN", "isSafeInteger",
        "parseFloat", "parseInt"
    ]),
};
const stringFilterGroup = {
    objectClass: String,
    prefix: "string",
    prefixShort: "s",
    prototypeFuncs: new Set([
        "at", "charAt", "charCodeAt", "codePointAt",
        "concat", "endsWith", "includes", "indexOf",
        "lastIndexOf", "localeCompare", "match", "normalize",
        "padEnd", "padStart", "repeat", "replace",
        "replaceAll", "search", "slice", "split",
        "startsWith", "substring", "toLocaleLowerCase", "toLocaleUpperCase",
        "toLowerCase", "toUpperCase", "trim", "trimEnd",
        "trimStart", "valueOf", "toString",
    ]),
    staticFuncs: new Set([
        "fromCharCode", "fromCodePoint", "raw"
    ]),
};
const dateFilterGroup = {
    objectClass: Date,
    prefix: "date",
    prefixShort: "",
    prototypeFuncs: new Set([
        "getDate", "getDay", "getFullYear", "getHours",
        "getMilliseconds", "getMinutes", "getMonth", "getSeconds",
        "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
        "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
        "getUTCMonth", "getUTCSeconds", "toDateString", "toISOString",
        "toJSON", "toLocaleDateString", "toLocaleString", "toLocaleTimeString",
        "toTimeString", "toUTCString", "valueOf", "toString",
    ]),
    staticFuncs: new Set([
        "now", "parse", "UTC"
    ]),
};
const setFilterGroup = {
    objectClass: Set,
    prefix: "set",
    prefixShort: "",
    prototypeFuncs: new Set([
        "entries", "forEach", "has", "keys", "values"
    ]),
    staticFuncs: new Set([]),
};
const mapFilterGroup = {
    objectClass: Map,
    prefix: "map",
    prefixShort: "",
    prototypeFuncs: new Set([
        "entries", "forEach", "get", "has", "keys", "values"
    ]),
    staticFuncs: new Set([
        "groupBy",
    ]),
};
const JSONFilterGroup = {
    objectClass: JSON,
    prefix: "json",
    prefixShort: "",
    prototypeFuncs: new Set([]),
    staticFuncs: new Set([
        "parse", "stringify"
    ]),
};
const mathFilterGroup = {
    objectClass: Math,
    prefix: "math",
    prefixShort: "",
    prototypeFuncs: new Set([]),
    staticFuncs: new Set([
        "abs", "acos", "acosh", "asin",
        "asinh", "atan", "atan2", "atanh",
        "cbrt", "ceil", "clz32", "cos",
        "cosh", "exp", "expm1", "floor",
        "fround", "hypot", "imul", "log",
        "log10", "log1p", "log2", "max",
        "min", "pow", "random", "round",
        "sign", "sin", "sinh", "sqrt",
        "tan", "tanh", "trunc"
    ]),
};
const regExpFilterGroup = {
    objectClass: RegExp,
    prefix: "regexp",
    prefixShort: "",
    prototypeFuncs: new Set([
        "exec", "test", "toString"
    ]),
    staticFuncs: new Set([]),
};
class DefaultFilters {
    static "truthy*" = (options) => (value) => value ? true : false;
    static "falsey*" = (options) => (value) => !value ? true : false;
    static "not*" = this["falsey*"];
    static eq = (options) => (value) => value == options[0]; // equality
    static ne = (options) => (value) => value != options[0]; // inequality
    static lt = (options) => (value) => Number(value) < Number(options[0]); // less than
    static le = (options) => (value) => Number(value) <= Number(options[0]); // less than or equal
    static gt = (options) => (value) => Number(value) > Number(options[0]); // greater than
    static ge = (options) => (value) => Number(value) >= Number(options[0]); // greater than or equal
    static oi = (options) => (value) => Number(options[0]) < Number(value) && Number(value) < Number(options[1]); // open interval
    static ci = (options) => (value) => Number(options[0]) <= Number(value) && Number(value) <= Number(options[1]); // closed interval
    static embed = (options) => (value) => (options[0] ?? "").replaceAll("%s", value);
    static iftext = (options) => (value) => value ? options[0] ?? null : options[1] ?? null;
    static "isnull*" = (options) => (value) => (value == null) ? true : false;
    static offset = (options) => (value) => Number(value) + Number(options[0]);
    static unit = (options) => (value) => String(value) + String(options[0]);
    static inc = this.offset;
    static mul = (options) => (value) => Number(value) * Number(options[0]);
    static div = (options) => (value) => Number(value) / Number(options[0]);
    static mod = (options) => (value) => Number(value) % Number(options[0]);
    static prop = (options) => (value) => value[options[0]];
    static prefix = (options) => (value) => String(options[0]) + String(value);
    static suffix = this.unit;
    static date = (options) => (value) => Date.prototype.toLocaleDateString.apply(value, ["sv-SE", options[0] ? options[0] : {}]);
    static "isnan*" = (options) => (value) => isNaN(value);
}
const defaultFilterGroup = {
    objectClass: DefaultFilters,
    prefix: "",
    prefixShort: "",
    prototypeFuncs: new Set([]),
    staticFuncs: new Set([
        "truthy*", "falsey*", "not*", "eq", "ne", "lt", "le", "gt", "ge", "oi", "ci",
        "embed", "iftext", "isnull*", "offset", "unit", "inc", "mul", "div", "mod",
        "prop", "prefix", "suffix", "date", "isnan*",
    ]),
};
function createPrototypeFilterFunc(ObjectClass, FuncName) {
    if (Reflect.has(ObjectClass, "prototype")) {
        const prototype = Reflect.get(ObjectClass, "prototype");
        if (Reflect.has(prototype, FuncName)) {
            const func = Reflect.get(prototype, FuncName);
            return ((options) => (value) => func.apply(value, options));
        }
    }
    return undefined;
}
function createStaticFilterFunc(ObjectClass, FuncName) {
    if (Reflect.has(ObjectClass, FuncName)) {
        const func = Reflect.get(ObjectClass, FuncName);
        return ((options) => (value) => func.apply(null, [value, ...options]));
    }
    return undefined;
}
const outputGroups = [
    dateFilterGroup, setFilterGroup, mapFilterGroup, JSONFilterGroup,
    regExpFilterGroup, arrayFilterGroup, objectFilterGroup,
    numberFilterGroup, stringFilterGroup, mathFilterGroup,
];
const nullthru = (callback) => (options) => (value) => value == null ? value : callback(options)(value);
const reduceApplyFilter = (value, filter) => filter(value);
const thru$2 = ((options) => (value) => value);
class Filters {
    static create(filters, manager) {
        const filterFuncs = [];
        for (let i = 0; i < filters.length; i++) {
            const filter = filters[i];
            const filterFuncWithOptions = manager.getFilterFunc(filter.name);
            const filterFunc = filterFuncWithOptions(filter.options);
            filterFuncs.push(filterFunc);
        }
        return filterFuncs;
    }
}
class FilterManager {
    ambigousNames = new Set;
    funcByName = new Map;
    /**
     * register user defined filter, check duplicate name
     */
    registerFilter(funcName, filterFunc) {
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        if (this.funcByName.has(realFuncName)) {
            utils.raise(`${this.constructor.name}: ${realFuncName} is already registered`);
        }
        const wrappedFunc = !isNotNullThru ? nullthru(filterFunc) : filterFunc;
        this.funcByName.set(realFuncName, wrappedFunc);
    }
    /**
     * get filter function by name
     */
    getFilterFunc(name) {
        this.ambigousNames.has(name) && utils.raise(`${this.constructor.name}: ${name} is ambigous`);
        return this.funcByName.get(name) ?? thru$2;
    }
    static applyFilter(value, filters) {
        return filters.reduce(reduceApplyFilter, value);
    }
}
class OutputFilterManager extends FilterManager {
    constructor() {
        super();
        this.ambigousNames = new Set(OutputFilterManager.#ambigousNames);
        this.funcByName = new Map(OutputFilterManager.#funcByName);
    }
    static #ambigousNames = new Set;
    static #funcByName = new Map;
    static {
        const ambigousNames = new Set;
        const funcByName = new Map;
        for (const group of outputGroups) {
            for (const funcName of group.prototypeFuncs) {
                const isNotNullThru = funcName.endsWith("*");
                const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
                const func = createPrototypeFilterFunc(group.objectClass, realFuncName);
                if (typeof func !== "undefined") {
                    const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
                    group.prefix && funcByName.set(`${group.prefix}.${realFuncName}`, wrappedFunc);
                    group.prefixShort && funcByName.set(`${group.prefixShort}.${realFuncName}`, wrappedFunc);
                    if (funcByName.has(realFuncName)) {
                        ambigousNames.add(realFuncName);
                    }
                    else {
                        funcByName.set(realFuncName, wrappedFunc);
                    }
                }
            }
            for (const funcName of group.staticFuncs) {
                const isNotNullThru = funcName.endsWith("*");
                const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
                const func = createStaticFilterFunc(group.objectClass, realFuncName);
                if (typeof func !== "undefined") {
                    const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
                    group.prefix && funcByName.set(`${group.prefix}.${realFuncName}`, wrappedFunc);
                    group.prefixShort && funcByName.set(`${group.prefixShort}.${realFuncName}`, wrappedFunc);
                    if (funcByName.has(realFuncName)) {
                        ambigousNames.add(realFuncName);
                    }
                    else {
                        funcByName.set(realFuncName, wrappedFunc);
                    }
                }
            }
        }
        for (const funcName of defaultFilterGroup.staticFuncs) {
            const isNotNullThru = funcName.endsWith("*");
            const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
            const func = Reflect.get(DefaultFilters, funcName);
            if (typeof func === "undefined") {
                utils.raise(`${this.name}: ${funcName} is not found in defaultFilterGroup`);
            }
            const wrappedFunc = !isNotNullThru ? nullthru(func) : func;
            funcByName.set(realFuncName, wrappedFunc);
        }
        for (const funcName of ambigousNames) {
            funcByName.delete(funcName);
        }
        this.#ambigousNames = ambigousNames;
        this.#funcByName = funcByName;
    }
    static registerFilter(funcName, filterFunc) {
        const isNotNullThru = funcName.endsWith("*");
        const realFuncName = isNotNullThru ? funcName.slice(0, -1) : funcName;
        if (this.#funcByName.has(realFuncName)) {
            utils.raise(`${this.name}: ${realFuncName} is already registered`);
        }
        const wrappedFunc = !isNotNullThru ? nullthru(filterFunc) : filterFunc;
        this.#funcByName.set(realFuncName, wrappedFunc);
    }
}
class InputFilters {
    static date = (options) => (value) => value === "" ? null : new Date(new Date(value).setHours(0));
    static number = (options) => (value) => value === "" ? null : Number(value);
    static boolean = (options) => (value) => (value === "false" || value === "") ? false : true;
}
class InputFilterManager extends FilterManager {
    constructor() {
        super();
        this.ambigousNames = new Set(InputFilterManager.#ambigousNames);
        this.funcByName = new Map(InputFilterManager.#funcByName);
    }
    static #ambigousNames = new Set;
    static #funcByName = new Map;
    static {
        this.#funcByName.set("date", InputFilters.date);
        this.#funcByName.set("number", InputFilters.number);
        this.#funcByName.set("boolean", InputFilters.boolean);
    }
    static registerFilter(name, filterFunc) {
        if (this.#funcByName.has(name)) {
            utils.raise(`${this.name}: ${name} is already registered`);
        }
        this.#funcByName.set(name, filterFunc);
    }
}
class EventFilters {
    static preventDefault = (options) => (event) => {
        event.preventDefault();
        return event;
    };
    static noStopPropagation = (options) => (event) => {
        Reflect.set(event, "noStopPropagation", true);
        return event;
    };
    static pd = this.preventDefault;
    static nsp = this.noStopPropagation;
}
class EventFilterManager extends FilterManager {
    constructor() {
        super();
        this.ambigousNames = new Set(EventFilterManager.#ambigousNames);
        this.funcByName = new Map(EventFilterManager.#funcByName);
    }
    static #ambigousNames = new Set;
    static #funcByName = new Map;
    static {
        this.#funcByName.set("preventDefault", EventFilters.preventDefault);
        this.#funcByName.set("noStopPropagation", EventFilters.noStopPropagation);
        this.#funcByName.set("pd", EventFilters.preventDefault);
        this.#funcByName.set("nsp", EventFilters.noStopPropagation);
    }
    static registerFilter(name, filterFunc) {
        if (this.#funcByName.has(name)) {
            utils.raise(`${this.name}: ${name} is already registered`);
        }
        this.#funcByName.set(name, filterFunc);
    }
}

const name$2 = "state";
const AccessorPropertiesSymbol = Symbol.for(`${name$2}.accessorProperties`);
const DependenciesSymbol = Symbol.for(`${name$2}.dependencies`);
const ConnectedEventSymbol = Symbol.for(`${name$2}.connectedEvent`);
const DisconnectedEventSymbol = Symbol.for(`${name$2}.disconnectedEvent`);
const UpdatedEventSymbol = Symbol.for(`${name$2}.updatedEvent`);
const ConnectedCallbackSymbol = Symbol.for(`${name$2}.connectedCallback`);
const DisconnectedCallbackSymbol = Symbol.for(`${name$2}.disconnectedCallback`);
const UpdatedCallbackSymbol = Symbol.for(`${name$2}.updatedCallback`);
const DirectryCallApiSymbol = Symbol.for(`${name$2}.directlyCallApi`);
const NotifyForDependentPropsApiSymbol = Symbol.for(`${name$2}.notifyForDependentPropsApi`);
const GetDependentPropsApiSymbol = Symbol.for(`${name$2}.getDependentPropsApi`);
const ClearCacheApiSymbol = Symbol.for(`${name$2}.clearCacheApi`);
const CreateBufferApiSymbol = Symbol.for(`${name$2}.createBufferApi`);
const FlushBufferApiSymbol = Symbol.for(`${name$2}.flushBufferApi`);

const DEPENDENCIES = "$dependentProps";

function getDescByNames(target) {
    const descByNames = {};
    let object = target;
    while (object !== Object.prototype) {
        const descs = Object.getOwnPropertyDescriptors(object);
        console.log("descs", descs);
        for (const [name, desc] of Object.entries(descs)) {
            if (Reflect.has(descByNames, name))
                continue;
            descByNames[name] = desc;
        }
        object = Object.getPrototypeOf(object);
    }
    return descByNames;
}
function _getAccessorProperties(target) {
    const descByNames = getDescByNames(target);
    const accessorProperties = [];
    for (const [name, desc] of Object.entries(descByNames)) {
        if (desc.get || desc.set)
            accessorProperties.push(name);
    }
    return accessorProperties;
}
const _cache$4 = new Map();
function getAccessorProperties(target) {
    let retValue = _cache$4.get(target.constructor);
    if (typeof retValue === "undefined") {
        retValue = _getAccessorProperties(target);
        if ({}.constructor !== target.constructor)
            _cache$4.set(target.constructor, retValue);
    }
    return retValue;
}

const WILDCARD = "*";
const DELIMITER = ".";
const RE_CONTEXT_INDEX = new RegExp(/^\$([0-9]+)$/);

function _getPatternNameInfo(name) {
    const pathNames = name.split(DELIMITER);
    const parentPathNames = pathNames.slice(0, -1);
    const parentPaths = parentPathNames.reduce((paths, pathName) => {
        paths.push(paths.at(-1)?.concat(pathName) ?? [pathName]);
        return paths;
    }, []).map((paths) => paths.join("."));
    const setOfParentPaths = new Set(parentPaths);
    const parentPath = parentPathNames.join(DELIMITER);
    const lastPathName = pathNames[pathNames.length - 1] ?? "";
    const regexp = new RegExp("^" + name.replaceAll(".", "\\.").replaceAll("*", "([0-9a-zA-Z_]*)") + "$");
    const level = pathNames.reduce((level, pathName) => level += (pathName === WILDCARD ? 1 : 0), 0);
    const isPrimitive = (pathNames.length === 1);
    const wildcardNames = [];
    for (let i = 0; i < pathNames.length; i++) {
        if (pathNames[i] === WILDCARD) {
            wildcardNames.push(pathNames.slice(0, i + 1).join("."));
        }
    }
    return {
        name,
        pathNames,
        parentPathNames,
        parentPaths,
        setOfParentPaths,
        parentPath,
        lastPathName,
        regexp,
        level,
        isPrimitive,
        wildcardNames,
    };
}
const _cache$3 = {};
function getPatternNameInfo(name) {
    return _cache$3[name] ?? (_cache$3[name] = _getPatternNameInfo(name));
}

function _getPropertyNameInfo(name) {
    const indexes = [];
    const patternPropElements = [];
    let isIncomplete = false;
    let lastIncompleteIndex = -1;
    for (const propElement of name.split(".")) {
        const index = Number(propElement);
        if (isNaN(index)) {
            patternPropElements.push(propElement);
            if (propElement === "*") {
                indexes.push(undefined);
                isIncomplete = true;
                lastIncompleteIndex = indexes.length - 1;
            }
        }
        else {
            indexes.push(index);
            patternPropElements.push("*");
        }
    }
    return {
        name,
        isPrimitive: (patternPropElements.length === 1),
        isDotted: (patternPropElements.length > 1),
        hasWildcard: (indexes.length > 0),
        patternName: patternPropElements.join("."),
        isIncomplete,
        indexes,
        lastIncompleteIndex,
    };
}
const _cache$2 = {};
function getPropertyNameInfo(name) {
    return _cache$2[name] ?? (_cache$2[name] = _getPropertyNameInfo(name));
}

/**
 * $dependentPropsを表現
 */
class DependentProps {
    #defaultProps = new Set;
    #propsByRefProp = new Map;
    constructor(props) {
        this.setDependentProps(props);
    }
    get propsByRefProp() {
        return this.#propsByRefProp;
    }
    hasDefaultProp(prop) {
        return this.#defaultProps.has(prop);
    }
    addDefaultProp(prop) {
        const propertyNameInfo = getPropertyNameInfo(prop);
        let patternNameInfo = getPatternNameInfo(propertyNameInfo.patternName);
        while (patternNameInfo.parentPath !== "") {
            const parentPatternNameInfo = getPatternNameInfo(patternNameInfo.parentPath);
            if (!this.#defaultProps.has(patternNameInfo.name)) {
                this.#propsByRefProp.get(parentPatternNameInfo.name)?.add(patternNameInfo.name) ??
                    this.#propsByRefProp.set(parentPatternNameInfo.name, new Set([patternNameInfo.name]));
                this.#defaultProps.add(patternNameInfo.name);
            }
            patternNameInfo = parentPatternNameInfo;
        }
    }
    setDependentProps(props) {
        for (const [prop, refProps] of Object.entries(props)) {
            for (const refProp of refProps) {
                this.#propsByRefProp.get(refProp)?.add(prop) ?? this.#propsByRefProp.set(refProp, new Set([prop]));
            }
        }
    }
}

class StateCache {
    #valueByIndexesStringByPatternName = new Map();
    get(patternName, indexesString) {
        return this.#valueByIndexesStringByPatternName.get(patternName)?.get(indexesString) ?? undefined;
    }
    has(patternName, indexesString) {
        return this.#valueByIndexesStringByPatternName.get(patternName)?.has(indexesString) ?? false;
    }
    set(patternName, indexesString, value) {
        this.#valueByIndexesStringByPatternName.get(patternName)?.set(indexesString, value) ??
            this.#valueByIndexesStringByPatternName.set(patternName, new Map([[indexesString, value]]));
        return value;
    }
    clear() {
        this.#valueByIndexesStringByPatternName.clear();
    }
}

const name$1 = "do-notation";
const GetDirectSymbol = Symbol.for(`${name$1}.getDirect`);
const SetDirectSymbol = Symbol.for(`${name$1}.setDirect`);

class PropertyAccess {
    patternName;
    indexes;
    #patternNameInfo;
    get patternNameInfo() {
        if (typeof this.#patternNameInfo === "undefined") {
            this.#patternNameInfo = getPatternNameInfo(this.patternName);
        }
        return this.#patternNameInfo;
    }
    constructor(patternName, indexes = []) {
        this.patternName = patternName;
        this.indexes = indexes;
    }
}

let Handler$1 = class Handler {
    #stackIndexes = [];
    get lastIndexes() {
        return this.#stackIndexes[this.#stackIndexes.length - 1] ?? [];
    }
    #lastIndexesString = undefined;
    get lastIndexesString() {
        if (typeof this.#lastIndexesString === "undefined") {
            if (typeof this.lastIndexes === "undefined")
                utils.raise("lastIndexes is undefined");
            this.#lastIndexesString = this.lastIndexes.join(",");
        }
        return this.#lastIndexesString;
    }
    get stackIndexes() {
        return this.#stackIndexes;
    }
    pushIndexes(indexes, callback) {
        this.#lastIndexesString = undefined;
        this.#stackIndexes.push(indexes);
        try {
            return callback();
        }
        finally {
            this.#stackIndexes.pop();
        }
    }
    getByPatternNameAndIndexes(target, { patternName, indexes }, receiver) {
        const value = Reflect.get(target, patternName, receiver);
        if (typeof value !== "undefined")
            return value;
        const patterNameInfo = getPatternNameInfo(patternName);
        // primitive
        if (patterNameInfo.isPrimitive)
            return undefined;
        const parent = this.getByPatternNameAndIndexes(target, { patternName: patterNameInfo.parentPath, indexes }, receiver);
        if (typeof parent === "undefined")
            return undefined;
        const lastName = (patterNameInfo.lastPathName === WILDCARD) ?
            indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
        return parent[lastName];
    }
    setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver) {
        const patterNameInfo = getPatternNameInfo(patternName);
        if (Reflect.has(target, patternName) || patterNameInfo.isPrimitive) {
            return Reflect.set(target, patternName, value, receiver);
        }
        else {
            const parent = this.getByPatternNameAndIndexes(target, { patternName: patterNameInfo.parentPath, indexes }, receiver);
            if (typeof parent === "undefined")
                utils.raise(`parent(${patterNameInfo.parentPath}) is undefined`);
            const lastName = (patterNameInfo.lastPathName === WILDCARD) ?
                indexes[patterNameInfo.level - 1] : patterNameInfo.lastPathName;
            parent[lastName] = value;
            return true;
        }
    }
    getValuesAndLevelIndex(target, { propertyNameInfo, lastIndexes }, receiver) {
        if (propertyNameInfo.lastIncompleteIndex === -1)
            utils.raise(`propertyName(${propertyNameInfo.name}) has no wildcard`);
        let levelIndex = -1;
        const indexes = propertyNameInfo.indexes.map((index, i) => {
            if (i !== propertyNameInfo.lastIncompleteIndex)
                return index ?? lastIndexes[i] ?? -1;
            levelIndex = i;
            return -1;
        });
        if (levelIndex === -1)
            utils.raise("propertyName has no wildcard");
        if (indexes.filter(index => index === -1).length > 1)
            utils.raise(`propertyName(${propertyNameInfo.name}) has many wildcards`);
        const patternNameInfo = getPatternNameInfo(propertyNameInfo.patternName);
        const expandingPatterName = patternNameInfo.wildcardNames[levelIndex];
        const expandingPatternNameInfo = getPatternNameInfo(expandingPatterName);
        const values = this.getByPatternNameAndIndexes(target, { patternName: expandingPatternNameInfo.parentPath, indexes }, receiver)();
        Array.isArray(values) || utils.raise("values is not an array");
        return { values, levelIndex, indexes };
    }
    getExpandLastIndex = (target, receiver) => (propertyName, lastIndexes) => {
        const propertyNameInfo = getPropertyNameInfo(propertyName);
        if (!propertyNameInfo.hasWildcard)
            utils.raise(`propertyName(${propertyName}) has no wildcard`);
        const { values, levelIndex, indexes } = this.getValuesAndLevelIndex(target, { propertyNameInfo, lastIndexes }, receiver);
        const results = [];
        for (const index in values) {
            indexes[levelIndex] = Number(index);
            results.push(this.getByPatternNameAndIndexes(target, { patternName: propertyNameInfo.patternName, indexes }, receiver));
        }
        return results;
    };
    setExpandLastIndex = (target, receiver) => (propertyName, lastIndexes, value) => {
        const propertyNameInfo = getPropertyNameInfo(propertyName);
        if (!propertyNameInfo.hasWildcard)
            utils.raise(`propertyName(${propertyName}) has no wildcard`);
        const { values, levelIndex, indexes } = this.getValuesAndLevelIndex(target, { propertyNameInfo, lastIndexes }, receiver);
        const setValues = Array.isArray(value) ? value : Array(values.length).fill(value);
        let result = true;
        for (const index in values) {
            indexes[levelIndex] = Number(index);
            result = result && this.setByPatternNameAndIndexes(target, { patternName: propertyNameInfo.patternName, indexes, value: setValues[index] }, receiver);
        }
        return result;
    };
    getDirect = (target, { patternName, indexes }, receiver) => () => {
        return this.pushIndexes(indexes, () => this.getByPatternNameAndIndexes(target, { patternName, indexes }, receiver));
    };
    setDirect = (target, { patternName, indexes, value }, receiver) => {
        return this.pushIndexes(indexes, () => this.setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver));
    };
    get(target, prop, receiver) {
        const isPropString = typeof prop === "string";
        do {
            if (isPropString && (prop.startsWith("@@__") || prop === "constructor"))
                break;
            if (prop === GetDirectSymbol) {
                const fn = Reflect.get(this, "getDirect", receiver);
                return (patternName, indexes) => Reflect.apply(fn, target, [target, { patternName, indexes }, receiver]);
            }
            if (prop === SetDirectSymbol) {
                const fn = Reflect.get(this, "setDirect", receiver);
                return (patternName, indexes, value) => Reflect.apply(fn, target, [target, { patternName, indexes, value }, receiver]);
            }
            if (!isPropString)
                break;
            const lastIndexes = this.lastIndexes;
            if (prop[0] === "$") {
                const match = RE_CONTEXT_INDEX.exec(prop);
                if (match) {
                    return (lastIndexes ?? utils.raise("lastIndexes is null"))[Number(match[1]) - 1];
                }
            }
            else if (prop[0] === "@") {
                const propertyName = prop.slice(1);
                return this.getExpandLastIndex(target, receiver)(propertyName, lastIndexes ?? utils.raise("lastIndexes is null"));
            }
            const propertyNameInfo = getPropertyNameInfo(prop);
            const indexes = propertyNameInfo.indexes.map((index, i) => index ?? (lastIndexes ?? utils.raise("lastIndexes is null"))[i]);
            return this.getByPatternNameAndIndexes(target, { patternName: propertyNameInfo.patternName, indexes }, receiver);
        } while (false);
        return Reflect.get(target, prop, receiver);
    }
    set(target, prop, value, receiver) {
        const isPropString = typeof prop === "string";
        do {
            if (isPropString && prop.startsWith("@@__"))
                break;
            if (!isPropString)
                break;
            const lastIndexes = this.lastIndexes;
            if (prop[0] === "$") {
                const match = RE_CONTEXT_INDEX.exec(prop);
                if (match) {
                    utils.raise(`context index(${prop}) is read only`);
                }
            }
            else if (prop[0] === "@") {
                const propertyName = prop.slice(1);
                return this.setExpandLastIndex(target, receiver)(propertyName, lastIndexes ?? utils.raise("lastIndexes is null"), value);
            }
            const propertyNameInfo = getPropertyNameInfo(prop);
            const indexes = propertyNameInfo.indexes.map((index, i) => index ?? (lastIndexes ?? utils.raise("lastIndexes is null"))[i]);
            return this.setByPatternNameAndIndexes(target, { patternName: propertyNameInfo.patternName, indexes, value }, receiver);
        } while (false);
        return Reflect.set(target, prop, value, receiver);
    }
};

class StateBaseHandler extends Handler$1 {
    #accessorProperties;
    get accessorProperties() {
        return this.#accessorProperties;
    }
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }
    #component;
    get component() {
        return this.#component;
    }
    constructor(component, accessorProperties, dependencies) {
        super();
        this.#component = component;
        this.#accessorProperties = accessorProperties;
        this.#dependencies = dependencies;
    }
    get(target, prop, receiver) {
        if (prop === AccessorPropertiesSymbol) {
            return this.#accessorProperties;
        }
        else if (prop === DependenciesSymbol) {
            return this.#dependencies;
        }
        return Reflect.get(target, prop, receiver);
    }
    ownKeys(target) {
        return Reflect.ownKeys(target).concat([
            AccessorPropertiesSymbol,
            DependenciesSymbol
        ]);
    }
    has(target, prop) {
        return Reflect.has(target, prop) || prop === AccessorPropertiesSymbol || prop === DependenciesSymbol;
    }
    addProcess(target, thisArg, argumentArray) {
        // todo: ここに処理を追加
        this.component.updator.addProcess(target, thisArg, argumentArray);
    }
    addNotify(target, propertyAccess, receiver) {
        // todo: ここに処理を追加
        this.#component.updator.addUpdatedStateProperty(Object.assign({}, propertyAccess));
    }
    clearCache() {
    }
    directlyCallback(loopContext, callback) {
    }
    static makeNotifyForDependentProps(state, propertyAccess, setOfSavePropertyAccessKeys = new Set([])) {
        const { patternNameInfo, indexes } = propertyAccess;
        const propertyAccessKey = patternNameInfo.name + "\t" + indexes.toString();
        if (setOfSavePropertyAccessKeys.has(propertyAccessKey))
            return [];
        setOfSavePropertyAccessKeys.add(propertyAccessKey);
        const dependentProps = state[GetDependentPropsApiSymbol]();
        const setOfProps = dependentProps.propsByRefProp.get(patternNameInfo.name);
        const propertyAccesses = [];
        if (typeof setOfProps === "undefined")
            return [];
        for (const prop of setOfProps) {
            const curPropertyNameInfo = getPatternNameInfo(prop);
            if (indexes.length < curPropertyNameInfo.level) {
                //if (curPropName.setOfParentPaths.has(propName.name)) continue;
                const listOfIndexes = StateBaseHandler.expandIndexes(state, new PropertyAccess(curPropertyNameInfo.name, indexes));
                propertyAccesses.push(...listOfIndexes.map(indexes => new PropertyAccess(curPropertyNameInfo.name, indexes)));
            }
            else {
                const notifyIndexes = indexes.slice(0, curPropertyNameInfo.level);
                propertyAccesses.push(new PropertyAccess(curPropertyNameInfo.name, notifyIndexes));
            }
            propertyAccesses.push(...this.makeNotifyForDependentProps(state, new PropertyAccess(curPropertyNameInfo.name, indexes), setOfSavePropertyAccessKeys));
        }
        return propertyAccesses;
    }
    static expandIndexes(state, propertyAccess) {
        const { patternNameInfo, patternName, indexes } = propertyAccess;
        if (patternNameInfo.level === indexes.length) {
            return [indexes];
        }
        else if (patternNameInfo.level < indexes.length) {
            return [indexes.slice(0, patternNameInfo.level)];
        }
        else {
            const getValuesFn = state[GetDirectSymbol];
            /**
             *
             * @param {string} parentName
             * @param {number} elementIndex
             * @param {number[]} loopIndexes
             * @returns {number[][]}
             */
            const traverse = (parentName, elementIndex, loopIndexes) => {
                const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
                const element = patternNameInfo.pathNames[elementIndex];
                const isTerminate = (patternNameInfo.pathNames.length - 1) === elementIndex;
                if (isTerminate) {
                    if (element === "*") {
                        const indexes = [];
                        const len = getValuesFn(parentName, loopIndexes).length;
                        for (let i = 0; i < len; i++) {
                            indexes.push(loopIndexes.concat(i));
                        }
                        return indexes;
                    }
                    else {
                        return [loopIndexes];
                    }
                }
                else {
                    const currentName = parentNameDot + element;
                    if (element === "*") {
                        if (loopIndexes.length < indexes.length) {
                            return traverse(currentName, elementIndex + 1, indexes.slice(0, loopIndexes.length + 1));
                        }
                        else {
                            const indexes = [];
                            const len = getValuesFn(parentName, loopIndexes).length;
                            for (let i = 0; i < len; i++) {
                                indexes.push(...traverse(currentName, elementIndex + 1, loopIndexes.concat(i)));
                            }
                            return indexes;
                        }
                    }
                    else {
                        return traverse(currentName, elementIndex + 1, loopIndexes);
                    }
                }
            };
            const listOfIndexes = traverse("", 0, []);
            return listOfIndexes;
        }
    }
}

const CONNECTED_EVENT = "connected";
const DISCONNECTED_EVENT = "disconnected";
const UPDATED_EVENT = "updated";
const createConnectedDetail = (...args) => { };
const createDisconnectedDetail = (...args) => { };
const createUpdatedDetail = (...args) => ({ props: args });
const createDetailFn = {
    [ConnectedEventSymbol]: createConnectedDetail,
    [DisconnectedEventSymbol]: createDisconnectedDetail,
    [UpdatedEventSymbol]: createUpdatedDetail,
};
const customEventNames = {
    [ConnectedEventSymbol]: CONNECTED_EVENT,
    [DisconnectedEventSymbol]: DISCONNECTED_EVENT,
    [UpdatedEventSymbol]: UPDATED_EVENT,
};
function dispatchCustomEvent(component, symbol, args) {
    const eventName = customEventNames[symbol] ?? utils.raise(`Unknown event symbol: ${symbol.description} `);
    const detailFn = createDetailFn[symbol] ?? utils.raise(`Unknown detail function for event symbol: ${symbol.description}`);
    const detail = detailFn(...args);
    const event = new CustomEvent(eventName, { detail });
    component.dispatchEvent(event);
}

const CONNECTED_CALLBACK = "$connectedCallback";
const DISCONNECTED_CALLBACK = "$disconnectedCallback";
const UPDATED_CALLBACK = "$updatedCallback";
const callbackNameBySymbol = {
    [ConnectedCallbackSymbol]: CONNECTED_CALLBACK,
    [DisconnectedCallbackSymbol]: DISCONNECTED_CALLBACK,
    [UpdatedCallbackSymbol]: UPDATED_CALLBACK,
};
const allCallbacks = new Set([
    ConnectedCallbackSymbol,
    DisconnectedCallbackSymbol,
    UpdatedCallbackSymbol,
]);
const callbackToEvent = {
    [ConnectedCallbackSymbol]: ConnectedEventSymbol,
    [DisconnectedCallbackSymbol]: DisconnectedEventSymbol,
    [UpdatedCallbackSymbol]: UpdatedEventSymbol,
};
class Callback {
    static get(state, stateProxy, handler, prop) {
        const callbackName = callbackNameBySymbol[prop] ?? utils.raise(`Unknown callback symbol: ${prop.description}`);
        const applyCallback = (...args) => async () => {
            (callbackName in state) && Reflect.apply(Reflect.get(state, callbackName), stateProxy, args);
            dispatchCustomEvent(handler.component, callbackToEvent[prop], args);
        };
        return (prop === ConnectedCallbackSymbol) ?
            (...args) => applyCallback(...args)() :
            (...args) => handler.addProcess(applyCallback(...args), stateProxy, []);
    }
    static has(prop) {
        if (typeof prop === "string" || typeof prop === "number")
            return false;
        return allCallbacks.has(prop);
    }
    static getSupportSymbol(prop) {
        if (typeof prop === "string" || typeof prop === "number")
            return undefined;
        return allCallbacks.has(prop) ? prop : undefined;
    }
}

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";
const apiFunctions = new Set([
    DirectryCallApiSymbol,
    NotifyForDependentPropsApiSymbol,
    GetDependentPropsApiSymbol,
    ClearCacheApiSymbol,
    CreateBufferApiSymbol,
    FlushBufferApiSymbol,
]);
const callFuncBySymbol = {
    [DirectryCallApiSymbol]: ({ state, stateProxy, handler }) => async (prop, loopContext, event) => handler.directlyCallback(loopContext, async () => Reflect.apply(Reflect.get(state, prop), stateProxy, [event, ...(loopContext?.allIndexes ?? [])])),
    [NotifyForDependentPropsApiSymbol]: ({ state, stateProxy, handler }) => (prop, indexes) => handler.addNotify(state, new PropertyAccess(prop, indexes), stateProxy),
    [GetDependentPropsApiSymbol]: ({ handler }) => () => handler.dependencies,
    [ClearCacheApiSymbol]: ({ handler }) => () => handler.clearCache(),
    [CreateBufferApiSymbol]: ({ stateProxy }) => (component) => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
    [FlushBufferApiSymbol]: ({ stateProxy }) => (buffer, component) => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
};
class Api {
    static get(state, stateProxy, handler, prop) {
        return callFuncBySymbol[prop]?.({ state, stateProxy, handler });
    }
    static has(prop) {
        if (typeof prop === "string" || typeof prop === "number")
            return false;
        return apiFunctions.has(prop);
    }
    static getSupportSymbol(prop) {
        if (typeof prop === "string" || typeof prop === "number")
            return undefined;
        return apiFunctions.has(prop) ? prop : undefined;
    }
}

function existsProperty(baseClass, prop) {
    if (typeof baseClass.prototype[prop] !== "undefined")
        return true;
    if (baseClass.prototype === Object.prototype)
        return false;
    return existsProperty(Object.getPrototypeOf(baseClass), prop);
}
const permittedProps = new Set([
    "addProcess", "viewRootElement ", "queryRoot",
    "asyncShowModal", "asyncShow",
    "asyncShowPopover", "cancelPopover"
]);
class UserProxyHandler {
    get(target, prop) {
        if (permittedProps.has(prop)) {
            return Reflect.get(target, prop);
        }
        else {
            if (existsProperty(target.baseClass, prop)) {
                return Reflect.get(target, prop);
            }
            else {
                utils.raise(`property ${prop} is not found in ${target.baseClass.name}`);
            }
        }
    }
}
function createUserComponent(component) {
    return new Proxy(component, new UserProxyHandler);
}

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";
const properties = new Set([
    GLOBALS_PROPERTY,
    DEPENDENT_PROPS_PROPERTY,
    COMPONENT_PROPERTY,
]);
const funcByName = {
    [GLOBALS_PROPERTY]: ({ component }) => component.globals, // component.globals,
    [DEPENDENT_PROPS_PROPERTY]: ({ state }) => Reflect.get(state, DEPENDENT_PROPS_PROPERTY),
    [COMPONENT_PROPERTY]: ({ component }) => createUserComponent(component),
};
class SpecialProp {
    static get(component, state, name) {
        return funcByName[name]?.({ component, state }) ?? utils.raise(`SpecialProp: ${name} is not found`);
    }
    static has(name) {
        return properties.has(name);
    }
}

class StateReadOnlyHandler extends StateBaseHandler {
    #cache = new StateCache;
    get cache() {
        return this.#cache;
    }
    clearCache() {
        this.#cache.clear();
    }
    getByPatternNameAndIndexes(target, { patternName, indexes }, receiver) {
        const patternNameInfo = getPatternNameInfo(patternName);
        if (!patternNameInfo.isPrimitive) {
            !this.dependencies.hasDefaultProp(patternName) &&
                this.dependencies.addDefaultProp(patternName);
        }
        if (SpecialProp.has(patternNameInfo.name)) {
            return SpecialProp.get(this.component, target, patternName);
        }
        else {
            if (!patternNameInfo.isPrimitive || this.accessorProperties.has(patternName)) {
                // プリミティブじゃないもしくはアクセサプロパティ場合、キャッシュから取得する
                const indexesString = patternNameInfo.level > 0 ? (patternNameInfo.level === indexes.length ?
                    indexes.toString() :
                    indexes.slice(0, patternNameInfo.level).join(",")) : "";
                const cachedValue = this.cache.get(patternName, indexesString);
                if (typeof cachedValue !== "undefined")
                    return cachedValue;
                if (this.cache.has(patternName, indexesString))
                    return undefined;
                const value = super.getByPatternNameAndIndexes(target, { patternName, indexes }, receiver);
                this.cache.set(patternName, indexesString, value);
                return value;
            }
            else {
                return super.getByPatternNameAndIndexes(target, { patternName, indexes }, receiver);
            }
        }
    }
    setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver) {
        utils.raise("StateReadOnlyHandler: State is read only");
    }
    get(target, prop, receiver) {
        if (typeof prop === "symbol") {
            const supportCallbackSymbol = Callback.getSupportSymbol(prop);
            if (typeof supportCallbackSymbol !== "undefined") {
                return Callback.get(target, receiver, this, supportCallbackSymbol);
            }
            const supportApiSymbol = Api.getSupportSymbol(prop);
            if (typeof supportApiSymbol !== "undefined") {
                return Api.get(target, receiver, this, supportApiSymbol);
            }
        }
        return super.get(target, prop, receiver);
    }
    set(target, prop, value, receiver) {
        utils.raise("StateReadOnlyHandler: State is read only");
    }
}

/**
 * DirectlyCall時、context情報の復帰を行う
 */
class DirectlyCallContext {
    #loopContext;
    get loopContext() {
        return this.#loopContext ?? utils.raise("DirectlyCallContext: loopContext is not set");
    }
    async callback(loopContext, directlyCallback) {
        if (typeof this.#loopContext !== "undefined")
            utils.raise("DirectlyCallContext: already set loopContext");
        this.#loopContext = loopContext;
        try {
            return await directlyCallback();
        }
        finally {
            this.#loopContext = undefined;
        }
    }
}

class StateWriteHandler extends StateBaseHandler {
    #directlyCallContext = new DirectlyCallContext;
    /**
     * プロパティ情報からViewModelの値を取得する
     * @param {ViewModel} target
     * @param {{propName:import("../../modules/dot-notation/dot-notation.js").PropertyName}}
     * @param {Proxy} receiver
     */
    getByPatternNameAndIndexes(target, { patternName, indexes }, receiver) {
        const patterNameInfo = getPatternNameInfo(patternName);
        if (!patterNameInfo.isPrimitive) {
            !this.dependencies.hasDefaultProp(patterNameInfo.name) && this.dependencies.addDefaultProp(patterNameInfo.name);
        }
        return (SpecialProp.has(patternName)) ?
            SpecialProp.get(this.component, target, patternName) :
            super.getByPatternNameAndIndexes(target, { patternName, indexes }, receiver);
    }
    /**
     * プロパティ情報からViewModelの値を設定する
     */
    setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver) {
        const patterNameInfo = getPatternNameInfo(patternName);
        if (!patterNameInfo.isPrimitive) {
            !this.dependencies.hasDefaultProp(patternName) && this.dependencies.addDefaultProp(patternName);
        }
        const result = super.setByPatternNameAndIndexes(target, { patternName, indexes, value }, receiver);
        this.addNotify(target, new PropertyAccess(patternName, indexes), receiver);
        return result;
    }
    async directlyCallback(loopContext, directlyCallback) {
        return this.#directlyCallContext.callback(loopContext, async () => {
            // directlyCallの場合、引数で$1,$2,...を渡す
            // 呼び出すメソッド内でthis.$1,this.$2,...みたいなアクセスはさせない
            // 呼び出すメソッド内でワイルドカードを含むドット記法でアクセスがあった場合、contextからindexesを復元する
            this.stackIndexes.push(undefined);
            try {
                return await directlyCallback();
            }
            finally {
                this.stackIndexes.pop();
            }
        });
    }
    #findLoopContext(prop) {
        if (typeof this.#directlyCallContext.loopContext === "undefined")
            return;
        if (typeof prop !== "string" || prop.startsWith("@@__") || prop === "constructor")
            return;
        const patternNameInfo = getPatternNameInfo(prop);
        if (patternNameInfo.level === 0 || prop.at(0) === "@")
            return;
        const wildcardPatternNameInfo = getPatternNameInfo(patternNameInfo.wildcardNames[patternNameInfo.wildcardNames.length - 1]);
        const loopContext = this.#directlyCallContext.loopContext.find(wildcardPatternNameInfo.parentPath);
        if (typeof loopContext === "undefined")
            utils.raise(`WritableViewModelHandler: ${prop} is outside loop`);
        return loopContext;
    }
    /**
     *
     * @param {ViewModel} target
     * @param {string} prop
     * @param {Proxy} receiver
     * @returns {any}
     */
    get(target, prop, receiver) {
        if (typeof prop === "symbol") {
            const supportCallbackSymbol = Callback.getSupportSymbol(prop);
            if (typeof supportCallbackSymbol !== "undefined") {
                return Callback.get(target, receiver, this, supportCallbackSymbol);
            }
            const supportApiSymbol = Api.getSupportSymbol(prop);
            if (typeof supportApiSymbol !== "undefined") {
                return Api.get(target, receiver, this, supportApiSymbol);
            }
        }
        if (typeof prop !== "string")
            return super.get(target, prop, receiver);
        const loopContext = this.#findLoopContext(prop);
        return (typeof loopContext !== "undefined") ?
            this.getDirect(target, { patternName: prop, indexes: loopContext.allIndexes }, receiver) :
            super.get(target, prop, receiver);
    }
    set(target, prop, value, receiver) {
        if (typeof prop !== "string")
            return super.set(target, prop, value, receiver);
        const loopContext = this.#findLoopContext(prop);
        return (typeof loopContext !== "undefined") ?
            this.setDirect(target, { patternName: prop, indexes: loopContext.allIndexes, value }, receiver) :
            super.set(target, prop, value, receiver);
    }
}

function getProxies(component, State) {
    const state = Reflect.construct(State, []);
    const accessorProperties = new Set(getAccessorProperties(state));
    const dependencies = new DependentProps(Reflect.get(state, DEPENDENCIES) ?? {});
    return {
        base: state,
        write: new Proxy(state, new StateWriteHandler(component, accessorProperties, dependencies)),
        readonly: new Proxy(state, new StateReadOnlyHandler(component, accessorProperties, dependencies)),
    };
}

// shadow rootが可能なタグ名一覧
const setOfAttachableTags = new Set([
    // See https://developer.mozilla.org/ja/docs/Web/API/Element/attachShadow
    "articles",
    "aside",
    "blockquote",
    "body",
    "div",
    "footer",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "main",
    "nav",
    "p",
    "section",
    "span",
]);
/**
 * タグ名がカスタム要素かどうか
 * →ダッシュ(-)を含むかどうか
 */
const isCustomTag = (tagName) => tagName.indexOf("-") !== -1;
/**
 * タグ名がshadow rootを持つことが可能か
 */
function isAttachable(tagName) {
    return isCustomTag(tagName) || setOfAttachableTags.has(tagName);
}

const ADOPTED_VAR_NAME = '--adopted-css';
const styleSheetByName = new Map;
/**
 * copy style rules to adopted style sheet
 */
function copyStyleRules(fromStyleSheet, toStyleSheet) {
    Array.from(fromStyleSheet.cssRules).map(rule => {
        if (rule.constructor.name === "CSSImportRule") {
            const importRule = rule;
            if (importRule.styleSheet) {
                copyStyleRules(importRule.styleSheet, toStyleSheet);
            }
            else {
                console.log(`import rule not found: ${importRule.href}`);
            }
        }
        else {
            toStyleSheet.insertRule(rule.cssText, toStyleSheet.cssRules.length);
        }
    });
}
/**
 * create adopted style sheet by name, and copy style rules from existing style sheet
 */
function createStyleSheet(name) {
    const styleSheet = new CSSStyleSheet();
    const matchTitle = (sheet) => sheet.title === name;
    const fromStyleSheets = Array.from(document.styleSheets).filter(matchTitle);
    if (fromStyleSheets.length === 0) {
        console.log(`style sheet not found: ${name}`);
        return;
    }
    fromStyleSheets.forEach(fromStyleSheet => copyStyleRules(fromStyleSheet, styleSheet));
    styleSheetByName.set(name, styleSheet);
    return styleSheet;
}
const trim$1 = (name) => name.trim();
/**
 * exclude empty name
 */
const excludeEmptyName = (name) => name.length > 0;
/**
 *
 * @param {string} name
 * @returns {CSSStyleSheet}
 */
const getStyleSheet = (name) => styleSheetByName.get(name) ?? createStyleSheet(name);
/**
 * exclude empty style sheet
 */
const excludeEmptySheet = (styleSheet) => typeof styleSheet !== "undefined";
/**
 * get adopted css list by names
 */
function getStyleSheetList(names) {
    // find adopted style sheet from map, if not found, create adopted style sheet
    return names.map(getStyleSheet).filter(excludeEmptySheet);
}
/**
 * get name list from component style variable '--adopted-css'
 */
function getNamesFromComponent(component) {
    // get adopted css names from component style variable '--adopted-css'
    return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim$1).filter(excludeEmptyName) ?? [];
}

class LoopContext {
    #bindingManager;
    get bindingManager() {
        return this.#bindingManager;
    }
    get parentBindingManager() {
        return this.bindingManager.parentBinding?.bindingManager;
    }
    get binding() {
        return this.bindingManager.parentBinding;
    }
    get nearestBindingManager() {
        const prop = getPatternNameInfo(this.name); // ex. "list.*.detail.names.*"
        if (prop.level <= 0)
            return;
        const lastWildCardPath = prop.wildcardNames[prop.wildcardNames.length - 1]; // ex. "list.*.detail.names.*"
        const wildcardProp = getPatternNameInfo(lastWildCardPath); // ex. "list.*.detail.names.*"
        const parentProp = getPatternNameInfo(wildcardProp.parentPath); // ex. "list.*.detail.names"
        const searchName = parentProp.name; // ex. "list"
        let curBindingManager = this.parentBindingManager;
        while (typeof curBindingManager !== "undefined") {
            if (curBindingManager.loopContext.binding?.stateProperty.name === searchName) {
                return curBindingManager;
            }
            curBindingManager = curBindingManager.loopContext.parentBindingManager;
        }
    }
    get nearestLoopContext() {
        return this.nearestBindingManager?.loopContext;
    }
    #revision = -1;
    #index = -1;
    get _index() {
        const revision = this.bindingManager.component.contextRevision;
        if (this.#revision !== revision) {
            this.#index = this.binding?.children.indexOf(this.#bindingManager) ?? -1;
            this.#revision = revision;
        }
        return this.#index;
    }
    get index() {
        if (this.binding?.loopable) {
            return this._index;
        }
        else {
            // 上位のループコンテキストのインデックスを取得
            const parentLoopContext = this.parentBindingManager?.loopContext;
            return parentLoopContext?.index ?? -1;
        }
    }
    get name() {
        if (this.binding?.loopable) {
            return this.binding.stateProperty.name;
        }
        else {
            // 上位のループコンテキストの名前を取得
            const parentLoopContext = this.parentBindingManager?.loopContext;
            return parentLoopContext?.name ?? "";
        }
    }
    get indexes() {
        if (this.binding?.loopable) {
            return this.nearestLoopContext?.indexes.concat(this.index) ?? [this.index];
        }
        else {
            // 上位のループコンテキストのインデクッス配列を取得
            const parentLoopContext = this.parentBindingManager?.loopContext;
            return parentLoopContext?.indexes ?? [];
        }
    }
    get allIndexes() {
        if (typeof this.binding === "undefined")
            return [];
        const index = (this.binding.loopable) ? this._index : -1;
        const indexes = this.parentBindingManager?.loopContext.allIndexes ?? [];
        return (index >= 0) ? indexes.concat(index) : indexes;
    }
    constructor(bindingManager) {
        this.#bindingManager = bindingManager;
    }
    find(name) {
        let loopContext = this;
        while (typeof loopContext !== "undefined") {
            if (loopContext.name === name)
                return loopContext;
            loopContext = loopContext.parentBindingManager?.loopContext;
        }
    }
}

const replaceTextNodeText = (node) => {
    const textNode = document.createTextNode("");
    node.parentNode?.replaceChild(textNode, node);
    return textNode;
};
const itsSelf = (node) => node;
const replaceTextNodeFn = {
    Text: replaceTextNodeText,
    HTMLElement: itsSelf,
    SVGElement: itsSelf,
    Template: itsSelf,
};
/**
 * replace comment node to text node
 */
const replaceTextNode = (node, nodeType) => replaceTextNodeFn[nodeType](node);

const DATASET_BIND_PROPERTY = 'data-bind';
const removeAttributeFromElement = (node) => {
    const element = node;
    element.removeAttribute(DATASET_BIND_PROPERTY);
    return element;
};
const thru$1 = (node) => node;
const removeAttributeByNodeType = {
    HTMLElement: removeAttributeFromElement,
    SVGElement: removeAttributeFromElement,
    Text: thru$1,
    Template: thru$1,
};
/**
 * remove data-bind attribute from node
 */
const removeAttribute = (node, nodeType) => removeAttributeByNodeType[nodeType](node);

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 */
const isInputableHTMLElement = (node) => node instanceof HTMLElement &&
    (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));
const alwaysFalse = (node) => false;
const isInputableFn = {
    HTMLElement: isInputableHTMLElement,
    SVGElement: alwaysFalse,
    Text: alwaysFalse,
    Template: alwaysFalse,
};
const getIsInputable = (node, nodeType) => isInputableFn[nodeType](node);

const SAMENAME = "@";
const DEFAULT = "$";
const trim = (s) => s.trim();
const has = (s) => s.length > 0; // check length
const re = new RegExp(/^#(.*)#$/);
const decode = (s) => {
    const m = re.exec(s);
    return m ? decodeURIComponent(m[1]) : s;
};
/**
 * parse filter part
 * "eq,100|falsey" ---> [Filter(eq, [100]), Filter(falsey)]
 */
const parseFilter = (text) => {
    const [name, ...options] = text.split(",").map(trim);
    return { name, options: options.map(decode) };
};
/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 */
const parseViewModelProperty = (text) => {
    const [stateProperty, ...filterTexts] = text.split("|").map(trim);
    return { stateProperty, filters: filterTexts.map(parseFilter) };
};
/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 */
const parseExpression = (expr, defaultName) => {
    const [nodeProperty, statePropertyText] = [defaultName].concat(...expr.split(":").map(trim)).splice(-2);
    const { stateProperty, filters } = parseViewModelProperty(statePropertyText);
    return { nodeProperty, stateProperty, filters };
};
/**
 * parse bind text and return BindTextInfo[]
 */
const parseBindText = (text, defaultName) => {
    return text.split(";").map(trim).filter(has).map(s => {
        let { nodeProperty, stateProperty, filters } = parseExpression(s, DEFAULT);
        stateProperty = stateProperty === SAMENAME ? nodeProperty : stateProperty;
        nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
        typeof nodeProperty === "undefined" && utils.raise("parseBindText: default property undefined");
        return { nodeProperty, stateProperty, filters };
    });
};
const _cache$1 = {};
/**
 * parse bind text and return BindTextInfo[], if hit cache return cache value
 */
function parse(text, defaultName) {
    if (text.trim() === "")
        return [];
    const key = text + "\t" + defaultName;
    return _cache$1[key] ?? (_cache$1[key] = parseBindText(text, defaultName));
}

const DEFAULT_PROPERTY = "textContent";
const defaultPropertyByElementType = {
    "radio": "checked",
    "checkbox": "checked",
    "button": "onclick",
};
/**
 * HTML要素のデフォルトプロパティを取得
 */
const getDefaultPropertyHTMLElement = (node) => node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLOptionElement ? "value" :
    node instanceof HTMLButtonElement ? "onclick" :
        node instanceof HTMLAnchorElement ? "onclick" :
            node instanceof HTMLFormElement ? "onsubmit" :
                node instanceof HTMLInputElement ? (defaultPropertyByElementType[node.type] ?? "value") :
                    DEFAULT_PROPERTY;
const defaultPropertyByKey = {};
const undefinedProperty = (node) => undefined;
const textContentProperty = (node) => DEFAULT_PROPERTY;
const getDefaultPropertyByNodeType = {
    HTMLElement: getDefaultPropertyHTMLElement,
    SVGElement: undefinedProperty,
    Text: textContentProperty,
    Template: undefinedProperty,
};
/**
 * get html element's default property
 */
const getDefaultProperty = (node, nodeType) => {
    const key = node.constructor.name + "\t" + (node.type ?? ""); // type attribute
    return defaultPropertyByKey[key] ?? (defaultPropertyByKey[key] = getDefaultPropertyByNodeType[nodeType](node));
};

class MultiValue {
    value;
    enabled = false;
    constructor(value, enabled) {
        this.value = value;
        this.enabled = enabled;
    }
}

class StateProperty {
    get state() {
        return this.#binding.component.currentState;
    }
    #name;
    get name() {
        return this.#name;
    }
    #propertyName;
    get propertyName() {
        return this.#propertyName;
    }
    #patternName;
    get patternName() {
        return this.#patternName;
    }
    #level;
    get level() {
        return this.#level;
    }
    get indexes() {
        const indexes = this.binding.loopContext?.indexes ?? [];
        return indexes.length === this.level ? indexes : indexes.slice(0, this.level);
    }
    get indexesString() {
        return this.indexes.toString();
    }
    get key() {
        return this.name + "\t" + this.indexesString;
    }
    #oldKey = "";
    get oldKey() {
        return this.#oldKey;
    }
    get isChagedKey() {
        return this.#oldKey !== this.key;
    }
    getKey() {
        this.#oldKey = this.key;
        return this.key;
    }
    get value() {
        return this.state[GetDirectSymbol](this.name, this.indexes);
    }
    set value(value) {
        const setValue = (value) => {
            this.state[SetDirectSymbol](this.name, this.indexes, value);
        };
        if (value instanceof MultiValue) {
            const thisValue = this.value;
            if (Array.isArray(thisValue)) {
                const setOfThisValue = new Set(thisValue);
                value.enabled ? setOfThisValue.add(value.value) : setOfThisValue.delete(value.value);
                setValue(Array.from(setOfThisValue));
            }
            else {
                setValue(value.enabled ? value.value : undefined);
            }
        }
        else {
            setValue(value);
        }
    }
    #filters;
    get filters() {
        return this.#filters;
    }
    get filteredValue() {
        return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
    }
    // applyToViewModel()の対象かどうか
    get applicable() {
        return true;
    }
    #binding;
    get binding() {
        return this.#binding;
    }
    constructor(binding, name, filters) {
        this.#binding = binding;
        this.#name = name;
        this.#filters = Filters.create(filters, binding.component.outputFilterManager);
        this.#propertyName = getPropertyNameInfo(name);
        this.#patternName = getPatternNameInfo(name);
        this.#level = this.#patternName.level;
    }
    assign(binding, name, filters) {
        this.#binding = binding;
        this.#name = name;
        this.#filters = Filters.create(filters, binding.component.outputFilterManager);
        this.#propertyName = getPropertyNameInfo(name);
        this.#patternName = getPatternNameInfo(name);
        this.#level = this.#patternName.level;
        return this;
    }
    /**
     * 初期化処理
     * 特に何もしない
     */
    initialize() {
    }
    getChildValue(index) {
        return this.state[GetDirectSymbol](`${this.name}.*`, this.indexes.concat(index));
    }
    setChildValue(index, value) {
        return this.state[SetDirectSymbol](`${this.name}.*`, this.indexes.concat(index), value);
    }
    dispose() {
    }
}

class NodeProperty {
    #node;
    get node() {
        return this.#node;
    }
    #name;
    get name() {
        return this.#name;
    }
    #nameElements;
    get nameElements() {
        return this.#nameElements;
    }
    get value() {
        return Reflect.get(this.node, this.name);
    }
    set value(value) {
        Reflect.set(this.node, this.name, value);
    }
    #filters;
    get filters() {
        return this.#filters;
    }
    /** @type {any} */
    get filteredValue() {
        return this.filters.length === 0 ? this.value : FilterManager.applyFilter(this.value, this.filters);
    }
    // applyToNode()の対象かどうか
    get applicable() {
        return true;
    }
    #binding;
    get binding() {
        return this.#binding;
    }
    get expandable() {
        return false;
    }
    get isSelectValue() {
        return false;
    }
    get loopable() {
        return false;
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof Node))
            utils.raise("NodeProperty: not Node");
        this.#binding = binding;
        this.#node = node;
        this.#name = name;
        this.#nameElements = name.split(".");
        this.#filters = Filters.create(filters.toReversed(), binding.component.inputFilterManager);
    }
    assign(binding, node, name, filters) {
        this.#binding = binding;
        this.#node = node;
        this.#name = name;
        this.#nameElements = name.split(".");
        const workFilters = filters.slice(0);
        workFilters.reverse();
        this.#filters = Filters.create(workFilters, binding.component.inputFilterManager);
        return this;
    }
    initialize() {
    }
    postUpdate(propertyAccessByViewModelPropertyKey) {
    }
    isSameValue(value) {
        return this.value === value;
    }
    applyToChildNodes(setOfIndex) {
    }
    dispose() {
    }
}

const regexp$1 = RegExp(/^\$[0-9]+$/);
class ContextIndex extends StateProperty {
    get index() {
        return Number(this.name.slice(1)) - 1;
    }
    get value() {
        return this.binding.loopContext.allIndexes[this.index];
    }
    get indexes() {
        return [];
    }
    get indexesString() {
        return "";
    }
    constructor(binding, name, filters) {
        if (!regexp$1.test(name))
            utils.raise(`ContextIndex: invalid name ${name}`);
        super(binding, name, filters);
    }
}

const PREFIX$3 = "@@|";
class TemplateProperty extends NodeProperty {
    #template;
    get template() {
        if (typeof this.#template === "undefined") {
            this.#template = getByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
        }
        return this.#template;
    }
    #uuid;
    get uuid() {
        if (typeof this.#uuid === "undefined") {
            this.#uuid = TemplateProperty.getUUID(this.node);
        }
        return this.#uuid;
    }
    static getUUID(node) {
        return node.textContent?.slice(PREFIX$3.length) ?? utils.raise("TemplateProperty: invalid node");
    }
    get expandable() {
        return true;
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof Comment))
            utils.raise("TemplateProperty: not Comment");
        super(binding, node, name, filters);
    }
}

const applyToNodeFunc = (bindingManager) => bindingManager.applyToNode();
class Repeat extends TemplateProperty {
    get loopable() {
        return true;
    }
    get value() {
        return this.binding.children.length;
    }
    set value(value) {
        if (!Array.isArray(value))
            utils.raise(`Repeat: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
        if (this.value < value.length) {
            this.binding.children.forEach(applyToNodeFunc);
            for (let newIndex = this.value; newIndex < value.length; newIndex++) {
                const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
                this.binding.appendChild(bindingManager);
                bindingManager.postCreate();
            }
        }
        else if (this.value > value.length) {
            const removeBindingManagers = this.binding.children.splice(value.length);
            this.binding.children.forEach(applyToNodeFunc);
            removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
        }
        else {
            this.binding.children.forEach(applyToNodeFunc);
        }
    }
    constructor(binding, node, name, filters) {
        if (name !== "loop")
            utils.raise(`Repeat: invalid property name '${name}'`);
        super(binding, node, name, filters);
    }
    isSameValue(value) {
        return false;
    }
}

class Branch extends TemplateProperty {
    get value() {
        return this.binding.children.length > 0;
    }
    /**
     * Set value to bind/unbind child bindingManager
     */
    set value(value) {
        if (typeof value !== "boolean")
            utils.raise(`Branch: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not boolean`);
        if (this.value !== value) {
            if (value) {
                const bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
                this.binding.appendChild(bindingManager);
                bindingManager.postCreate();
            }
            else {
                const removeBindingManagers = this.binding.children.splice(0, this.binding.children.length);
                removeBindingManagers.forEach(bindingManager => bindingManager.dispose());
            }
        }
        else {
            this.binding.children.forEach(bindingManager => bindingManager.applyToNode());
        }
    }
    constructor(binding, node, name, filters) {
        if (name !== "if")
            utils.raise(`Branch: invalid property name ${name}`);
        super(binding, node, name, filters);
    }
    isSameValue(value) {
        return false;
    }
}

class ElementBase extends NodeProperty {
    get element() {
        return this.node;
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof Element))
            utils.raise("ElementBase: not element");
        super(binding, node, name, filters);
    }
}

const NAME = "class";
class ElementClassName extends ElementBase {
    get value() {
        return this.element.className.length > 0 ? this.element.className.split(" ") : [];
    }
    set value(value) {
        if (!Array.isArray(value))
            utils.raise(`ElementClassName: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
        this.element.className = value.join(" ");
    }
    constructor(binding, node, name, filters) {
        if (name !== NAME)
            utils.raise(`ElementClassName: invalid property name ${name}`);
        super(binding, node, name, filters);
    }
}

class Checkbox extends ElementBase {
    get inputElement() {
        return this.node;
    }
    _value = new MultiValue(undefined, false);
    get value() {
        this._value.value = this.inputElement.value;
        this._value.enabled = this.inputElement.checked;
        return this._value;
    }
    set value(value) {
        if (!Array.isArray(value))
            utils.raise(`Checkbox: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
        const multiValue = this.filteredValue;
        this.inputElement.checked = value.some(v => v === multiValue.value);
    }
    _filteredValue = new MultiValue(undefined, false);
    get filteredValue() {
        const multiValue = this.value;
        this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
        this._filteredValue.enabled = multiValue.enabled;
        return this._filteredValue;
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof HTMLInputElement))
            utils.raise("Checkbox: not htmlInputElement");
        if (node.type !== "checkbox")
            utils.raise("Checkbox: not checkbox");
        super(binding, node, name, filters);
    }
    isSameValue(value) {
        return false;
    }
}

class Radio extends ElementBase {
    get inputElement() {
        return this.element;
    }
    _value = new MultiValue(undefined, false);
    get value() {
        this._value.value = this.inputElement.value;
        this._value.enabled = this.inputElement.checked;
        return this._value;
    }
    set value(value) {
        const multiValue = this.filteredValue;
        this.inputElement.checked = (value === multiValue.value) ? true : false;
    }
    _filteredValue = new MultiValue(undefined, false);
    get filteredValue() {
        const multiValue = this.value;
        this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
        this._filteredValue.enabled = multiValue.enabled;
        return this._filteredValue;
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof HTMLInputElement))
            utils.raise("Radio: not htmlInputElement");
        const element = node;
        if (element.type !== "radio" && element.type !== "checkbox")
            utils.raise("Radio: not radio or checkbox");
        super(binding, node, name, filters);
    }
    isSameValue(value) {
        return false;
    }
}

const PREFIX$2 = "on";
class ElementEvent extends ElementBase {
    // nameのonの後ろを取得する
    get eventType() {
        return this.name.slice(PREFIX$2.length); // on～
    }
    // applyToNode()の対象かどうか
    get applicable() {
        return false;
    }
    // イベントハンドラ
    #handler;
    get handler() {
        if (typeof this.#handler === "undefined") {
            this.#handler = event => this.eventHandler(event);
        }
        return this.#handler;
    }
    #eventFilters = [];
    get eventFilters() {
        return this.#eventFilters;
    }
    constructor(binding, node, name, filters) {
        if (!name.startsWith(PREFIX$2))
            utils.raise(`ElementEvent: invalid property name ${name}`);
        super(binding, node, name, filters);
        this.#eventFilters = Filters.create(filters, binding.component.eventFilterManager);
    }
    /**
     * 初期化処理
     * DOM要素にイベントハンドラの設定を行う
     */
    initialize() {
        this.element.addEventListener(this.eventType, this.handler);
    }
    async directlyCall(event) {
        // 再構築などでバインドが削除されている場合は処理しない
        if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false))
            return;
        const { stateProperty, loopContext } = this.binding;
        return stateProperty.state[DirectryCallApiSymbol](stateProperty.name, loopContext, event);
    }
    eventHandler(event) {
        // 再構築などでバインドが削除されている場合は処理しない
        if (!(this.binding.component?.bindingSummary.exists(this.binding) ?? false))
            return;
        // event filter
        event = this.eventFilters.length > 0 ? FilterManager.applyFilter(event, this.eventFilters) : event;
        !(Reflect.has(event, "noStopPropagation") ?? false) && event.stopPropagation();
        this.binding.component.updator.addProcess(this.directlyCall, this, [event]);
    }
}

const PREFIX$1 = "class.";
class ElementClass extends ElementBase {
    get className() {
        return this.nameElements[1];
    }
    get value() {
        return this.element.classList.contains(this.className);
    }
    set value(value) {
        if (typeof value !== "boolean")
            utils.raise(`ElementClass: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not boolean`);
        value ? this.element.classList.add(this.className) : this.element.classList.remove(this.className);
    }
    constructor(binding, node, name, filters) {
        if (!name.startsWith(PREFIX$1))
            utils.raise(`ElementClass: invalid property name ${name}`);
        super(binding, node, name, filters);
    }
}

class ElementAttribute extends ElementBase {
    get attributeName() {
        return this.nameElements[1];
    }
    get value() {
        return this.element.getAttribute(this.attributeName);
    }
    set value(value) {
        this.element.setAttribute(this.attributeName, value);
    }
}

class ElementStyle extends ElementBase {
    get htmlElement() {
        return this.node;
    }
    get styleName() {
        return this.nameElements[1];
    }
    get value() {
        return this.htmlElement.style.getPropertyValue(this.styleName);
    }
    set value(value) {
        this.htmlElement.style.setProperty(this.styleName, value);
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof HTMLElement))
            utils.raise("ElementStyle: not htmlElement");
        super(binding, node, name, filters);
    }
}

class ElementProperty extends ElementBase {
    #isSelectValue;
    get isSelectValue() {
        if (typeof this.#isSelectValue === "undefined") {
            this.#isSelectValue = this.node.constructor === HTMLSelectElement && this.name === "value";
        }
        return this.#isSelectValue;
    }
}

const name = "component";
const IsComponentSymbol = Symbol.for(`${name}.isComponent`);
const props = "props";
const BindPropertySymbol = Symbol.for(`${props}.bindProperty`);
const SetBufferSymbol = Symbol.for(`${props}.setBuffer`);
const GetBufferSymbol = Symbol.for(`${props}.getBuffer`);
const ClearBufferSymbol = Symbol.for(`${props}.clearBuffer`);
const CreateBufferSymbol = Symbol.for(`${props}.createBuffer`);
const FlushBufferSymbol = Symbol.for(`${props}.flushBuffer`);
const ClearSymbol = Symbol.for(`${props}.clear`);

class BindingPropertyAccess {
    #stateProperty;
    get name() {
        return this.#stateProperty.name;
    }
    get indexes() {
        return this.#stateProperty.indexes;
    }
    get loopContext() {
        return this.#stateProperty.binding.loopContext;
    }
    constructor(stateProperty) {
        this.#stateProperty = stateProperty;
    }
}
class ComponentProperty extends ElementBase {
    get propertyName() {
        return this.nameElements[1];
    }
    get applicable() {
        return true;
    }
    get thisComponent() {
        return this.node;
    }
    constructor(binding, node, name, filters) {
        if (Reflect.get(node, IsComponentSymbol) !== true)
            utils.raise("ComponentProperty: not Quel Component");
        // todo: バインドするプロパティ名のチェック
        // 「*」を含まないようにする
        super(binding, node, name, filters);
    }
    get value() {
        return super.value;
    }
    set value(value) {
        try {
            this.thisComponent.currentState[UpdatedCallbackSymbol]([new PropertyAccess(`${this.propertyName}`, [])]);
            this.thisComponent.currentState[NotifyForDependentPropsApiSymbol](this.propertyName, []);
        }
        catch (e) {
            console.log(e);
        }
    }
    /**
     * 初期化処理
     * コンポーネントプロパティのバインドを行う
     */
    initialize() {
        this.thisComponent.props[BindPropertySymbol](this.propertyName, new BindingPropertyAccess(this.binding.stateProperty));
    }
    /**
     * 更新後処理
     */
    postUpdate(propertyAccessBystatePropertyKey) {
        const statePropertyName = this.binding.stateProperty.name;
        for (const [key, propertyAccess] of propertyAccessBystatePropertyKey.entries()) {
            if (propertyAccess.patternName === statePropertyName ||
                propertyAccess.patternNameInfo.setOfParentPaths.has(statePropertyName)) {
                const remain = propertyAccess.patternName.slice(statePropertyName.length);
                //        console.log(`componentProperty:postUpdate(${propName}${remain})`);
                this.thisComponent.currentState[UpdatedCallbackSymbol]([new PropertyAccess(`${this.propertyName}${remain}`, propertyAccess.indexes)]);
                this.thisComponent.currentState[NotifyForDependentPropsApiSymbol](`${this.propertyName}${remain}`, propertyAccess.indexes);
            }
        }
    }
    isSameValue(value) {
        return false;
    }
}

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);
/**
 * Exclude from GC
 */
class RepeatKeyed extends Repeat {
    #fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    #lastIndexes = new Set;
    #setOfNewIndexes = new Set;
    #lastChildByNewIndex = new Map;
    get loopable() {
        return true;
    }
    #lastValue = [];
    get value() {
        return this.#lastValue;
    }
    set value(values) {
        if (!Array.isArray(values))
            utils.raise(`RepeatKeyed: ${this.binding.component.selectorName}.ViewModel['${this.binding.stateProperty.name}'] is not array`);
        this.#fromIndexByValue.clear();
        this.#lastIndexes.clear();
        this.#setOfNewIndexes.clear();
        this.#lastChildByNewIndex.clear();
        for (let newIndex = 0; newIndex < values.length; newIndex++) {
            // values[newIndex]では、get "values.*"()を正しく取得できない
            const value = this.binding.stateProperty.getChildValue(newIndex);
            const lastIndex = this.#lastValue.indexOf(value, this.#fromIndexByValue.get(value) ?? 0);
            if (lastIndex === -1) {
                // 元のインデックスにない場合（新規）
                this.#setOfNewIndexes.add(newIndex);
            }
            else {
                // 元のインデックスがある場合（既存）
                this.#fromIndexByValue.set(value, lastIndex + 1); // 
                this.#lastIndexes.add(lastIndex);
                this.#lastChildByNewIndex.set(newIndex, this.binding.children[lastIndex]);
            }
        }
        for (let i = 0; i < this.binding.children.length; i++) {
            if (this.#lastIndexes.has(i))
                continue;
            this.binding.children[i].dispose();
        }
        this.binding.children.slice(0);
        let beforeBindingManager;
        const parentNode = this.node.parentNode ?? utils.raise("parentNode is null");
        for (let i = 0; i < values.length; i++) {
            const newIndex = i;
            let bindingManager;
            const beforeNode = beforeBindingManager?.lastNode ?? this.node;
            if (this.#setOfNewIndexes.has(newIndex)) {
                // 元のインデックスにない場合（新規）
                bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
                (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
                parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
                bindingManager.postCreate();
            }
            else {
                // 元のインデックスがある場合（既存）
                bindingManager = this.#lastChildByNewIndex.get(newIndex) ?? utils.raise("bindingManager is undefined");
                if (bindingManager.nodes?.[0]?.previousSibling !== beforeNode) {
                    bindingManager.removeNodes();
                    parentNode.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
                }
                (newIndex < this.binding.children.length) ? (this.binding.children[newIndex] = bindingManager) : this.binding.children.push(bindingManager);
                bindingManager.applyToNode();
            }
            beforeBindingManager = bindingManager;
        }
        if (values.length < this.binding.children.length) {
            this.binding.children.length = values.length;
        }
        this.#lastValue = values.slice();
    }
    applyToChildNodes(setOfIndex) {
        const bindingManagerByValue = new Map;
        for (const index of setOfIndex) {
            const bindingManager = this.binding.children[index];
            if (typeof bindingManager === "undefined")
                continue;
            const oldValue = this.#lastValue[index];
            const typeofOldValue = typeof oldValue;
            if (typeofOldValue === "undefined")
                continue;
            if (setOfPrimitiveType.has(typeofOldValue))
                continue;
            bindingManager.removeNodes();
            bindingManagerByValue.set(oldValue, bindingManager);
        }
        for (const index of Array.from(setOfIndex).sort()) {
            const newValue = this.binding.stateProperty.getChildValue(index);
            const typeofNewValue = typeof newValue;
            if (typeofNewValue === "undefined")
                continue;
            if (setOfPrimitiveType.has(typeofNewValue))
                continue;
            let bindingManager = bindingManagerByValue.get(newValue);
            if (typeof bindingManager === "undefined") {
                bindingManager = BindingManager.create(this.binding.component, this.template, this.uuid, this.binding);
                this.binding.replaceChild(index, bindingManager);
                bindingManager.postCreate();
            }
            else {
                this.binding.replaceChild(index, bindingManager);
                bindingManager.applyToNode();
            }
        }
        this.#lastValue = this.binding.stateProperty.value.slice();
    }
    initialize() {
        this.#lastValue = [];
    }
    dispose() {
        super.dispose();
        this.#lastValue = [];
    }
}

const regexp = RegExp(/^\$[0-9]+$/);
const nodePropertyConstructorByNameByIsComment = {
    0: {
        "if": Branch,
    },
    1: {
        "class": ElementClassName,
        "checkbox": Checkbox,
        "radio": Radio,
    }
};
const createNodeProperty = (NodeProertyClass) => (binding, node, name, filters) => {
    return Reflect.construct(NodeProertyClass, [binding, node, name, filters]);
};
const createStateProperty = (StatePropertyClass) => (binding, name, filters) => {
    return Reflect.construct(StatePropertyClass, [binding, name, filters]);
};
const nodePropertyConstructorByFirstName = {
    "class": ElementClass,
    "attr": ElementAttribute,
    "style": ElementStyle,
    "props": ComponentProperty,
};
/**
 * get constructors for NodeProperty and ViewModelProperty
 */
const getPropertyCreators = (node, nodePropertyName, statePropertyName, useKeyed) => {
    const statePropertyClass = regexp.test(statePropertyName) ? ContextIndex : StateProperty;
    let nodePropertyClass;
    do {
        const isComment = node instanceof Comment;
        nodePropertyClass = nodePropertyConstructorByNameByIsComment[isComment ? 0 : 1][nodePropertyName];
        if (typeof nodePropertyClass !== "undefined")
            break;
        if (isComment && nodePropertyName === "loop") {
            nodePropertyClass = useKeyed ? RepeatKeyed : Repeat;
            break;
        }
        if (isComment)
            utils.raise(`Factory: unknown node property ${nodePropertyName}`);
        const nameElements = nodePropertyName.split(".");
        nodePropertyClass = nodePropertyConstructorByFirstName[nameElements[0]];
        if (typeof nodePropertyClass !== "undefined")
            break;
        if (node instanceof Element) {
            if (nodePropertyName.startsWith("on")) {
                nodePropertyClass = ElementEvent;
            }
            else {
                nodePropertyClass = ElementProperty;
            }
        }
        else {
            nodePropertyClass = NodeProperty;
        }
    } while (false);
    return {
        nodePropertyCreator: createNodeProperty(nodePropertyClass),
        statePropertyCreator: createStateProperty(statePropertyClass),
    };
};

const createBinding = (bindTextInfo, propertyCreators) => (bindingManager, node) => Binding.create(bindingManager, node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, bindTextInfo.filters);

/**
 * get indexes of childNodes from root node to the node
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 */
const computeNodeRoute = (node) => {
    let routeIndexes = [];
    while (node.parentNode !== null) {
        routeIndexes = [Array.from(node.parentNode.childNodes).indexOf(node), ...routeIndexes];
        node = node.parentNode;
    }
    return routeIndexes;
};
/**
 * find node by node route
 */
const findNodeByNodeRoute = (node, nodeRoute) => {
    for (let i = 0; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]])
        ;
    return node;
};

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";
const setDefaultEventHandlerByElement = (element) => (binding) => element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);
function initializeHTMLElement(node, isInputable, bindings, defaultName) {
    const element = node;
    // set event handler
    let hasDefaultEvent = false;
    let defaultBinding = null;
    let radioBinding = null;
    let checkboxBinding = null;
    for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
        radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
        checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
        defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
    }
    if (!hasDefaultEvent) {
        const setDefaultEventHandler = setDefaultEventHandlerByElement(element);
        if (radioBinding) {
            setDefaultEventHandler(radioBinding);
        }
        else if (checkboxBinding) {
            setDefaultEventHandler(checkboxBinding);
        }
        else if (defaultBinding && isInputable) {
            // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
            // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
            // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
            // ・nodeが入力系（input, textarea, select） → 入力系に限定
            setDefaultEventHandler(defaultBinding);
        }
    }
    return undefined;
}
const thru = () => { };
const initializeNodeByNodeType = {
    HTMLElement: initializeHTMLElement,
    SVGElement: thru,
    Text: thru,
    Template: thru,
};
const initializeNode = (nodeInfo) => (node, bindings) => initializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.isInputable, bindings, nodeInfo.defaultProperty);

class BindNodeInfo {
    nodeType;
    nodeRoute;
    nodeRouteKey;
    bindTextInfos;
    isInputable;
    defaultProperty;
    initializeNode;
    constructor(nodeType, nodeRoute, nodeRouteKey, bindTextInfos, isInputable, defaultProperty, initializeNode) {
        this.nodeType = nodeType;
        this.nodeRoute = nodeRoute;
        this.nodeRouteKey = nodeRouteKey;
        this.bindTextInfos = bindTextInfos;
        this.isInputable = isInputable;
        this.defaultProperty = defaultProperty;
        this.initializeNode = initializeNode(this);
    }
    static create(node, nodeType, bindText, useKeyed) {
        node = replaceTextNode(node, nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
        removeAttribute(node, nodeType);
        const isInputable = getIsInputable(node, nodeType);
        const defaultProperty = getDefaultProperty(node, nodeType) ?? "";
        const parseBindTextInfos = parse(bindText, defaultProperty);
        const bindTextInfos = [];
        for (let j = 0; j < parseBindTextInfos.length; j++) {
            const parseBindTextInfo = parseBindTextInfos[j];
            const { nodeProperty, stateProperty } = parseBindTextInfo;
            const propertyCreators = getPropertyCreators(node, nodeProperty, stateProperty, useKeyed);
            bindTextInfos.push({ ...parseBindTextInfo, ...propertyCreators, createBinding: createBinding(parseBindTextInfo, propertyCreators) });
        }
        const nodeRoute = computeNodeRoute(node);
        const nodeRouteKey = nodeRoute.join(",");
        return new BindNodeInfo(nodeType, nodeRoute, nodeRouteKey, bindTextInfos, isInputable, defaultProperty, initializeNode);
    }
}

const BIND_DATASET$1 = "bind";
/** get text to bind from data-bind attribute */
const getBindTextFromHTMLElement = (node) => node.dataset[BIND_DATASET$1] ?? "";
/** get text to bind from data-bind attribute */
const getBindTextFromSVGElement = (node) => node.dataset[BIND_DATASET$1] ?? "";
/** get text to bind from textContent property */
const getBindTextFromText = (node) => node.textContent?.slice(3) ?? "";
/** get text to bind from template's data-bind attribute, looking up by textContent property */
const getBindTextFromTemplate = (node) => getByUUID(node.textContent?.slice(3) ?? "")?.dataset[BIND_DATASET$1] ?? "";
const bindTextByNodeType = {
    HTMLElement: getBindTextFromHTMLElement,
    SVGElement: getBindTextFromSVGElement,
    Text: getBindTextFromText,
    Template: getBindTextFromTemplate,
};
const getBindText = (node, nodeType) => bindTextByNodeType[nodeType](node);

/**
 * is the node a comment node for template or text ?
 */
const isCommentNode = (node) => node instanceof Comment && ((node.textContent?.startsWith("@@:") ?? false) || (node.textContent?.startsWith("@@|") ?? false));
/**
 * get comment nodes for template or text
 */
const getCommentNodes = (node) => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : []));

const createNodeKey = (node) => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");
const nodeTypeByNodeKey = {};
const getNodeTypeByNode = (node) => (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" :
    (node instanceof HTMLElement) ? "HTMLElement" :
        (node instanceof Comment && node.textContent?.[2] === "|") ? "Template" :
            (node instanceof SVGElement) ? "SVGElement" : utils.raise(`Unknown NodeType: ${node.nodeType}`);
const getNodeType = (node, nodeKey = createNodeKey(node)) => nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;
function parseTemplate(template, useKeyed) {
    const nodeInfos = [];
    const rootElement = template.content;
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));
    nodeInfos.length = 0;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeType = getNodeType(node);
        const bindText = getBindText(node, nodeType);
        if (bindText.trim() === "")
            continue;
        nodeInfos[nodeInfos.length] = BindNodeInfo.create(nodes[i], nodeType, bindText, useKeyed);
    }
    return nodeInfos;
}

function createBindings(content, bindingManager, nodeInfos) {
    const bindings = [];
    for (let i = 0; i < nodeInfos.length; i++) {
        const nodeInfo = nodeInfos[i];
        const node = findNodeByNodeRoute(content, nodeInfo.nodeRoute);
        const nodeBindings = [];
        for (let j = 0; j < nodeInfo.bindTextInfos.length; j++) {
            nodeBindings[nodeBindings.length] =
                nodeInfo.bindTextInfos[j].createBinding(bindingManager, node); // push
        }
        nodeInfo.initializeNode(node, nodeBindings);
        bindings.push(...nodeBindings);
    }
    return bindings;
}

const UUID_DATASET = "uuid";
const _cache = {};
class Binder {
    template;
    uuid;
    nodeInfos;
    constructor(template, uuid, useKeyed) {
        this.template = template;
        this.uuid = uuid;
        this.nodeInfos = parseTemplate(this.template, useKeyed);
    }
    createBindings(content, bindingManager) {
        return createBindings(content, bindingManager, this.nodeInfos);
    }
    static create(template, useKeyed) {
        const uuid = template.dataset[UUID_DATASET] ?? "";
        return _cache[uuid] ?? (_cache[uuid] = new Binder(template, uuid, useKeyed));
    }
}

const setContextIndexesByIdByBindingManager = new Map;
class Popover {
    /**
     *
     * @param {BindingManager} bindingManager
     * @returns
     */
    static initialize(bindingManager) {
        let buttons = this.buttonsByFragment.get(bindingManager.fragment);
        if (typeof buttons === "undefined") {
            buttons = Array.from(bindingManager.fragment.querySelectorAll("[popovertarget]"));
            this.buttonsByFragment.set(bindingManager.fragment, buttons);
        }
        if (buttons.length === 0)
            return;
        for (const button of buttons) {
            const id = button.getAttribute("popovertarget") ?? utils.raise("popovertarget attribute not found");
            let setContextIndexes = setContextIndexesByIdByBindingManager.get(bindingManager)?.get(id);
            if (typeof setContextIndexes === "undefined") {
                const setContextIndexesFn = (bindingManager, id) => () => bindingManager.component.popoverContextIndexesById.set(id, bindingManager.loopContext.indexes);
                setContextIndexes = setContextIndexesFn(bindingManager, id);
                setContextIndexesByIdByBindingManager.get(bindingManager)?.set(id, setContextIndexes) ??
                    setContextIndexesByIdByBindingManager.set(bindingManager, new Map([[id, setContextIndexes]]));
            }
            button.removeEventListener("click", setContextIndexes);
            button.addEventListener("click", setContextIndexes);
        }
    }
    static dispose(bindingManager) {
        setContextIndexesByIdByBindingManager.delete(bindingManager);
    }
    static buttonsByFragment = new Map;
}

let seq = 0;
class Binding {
    #id = -1;
    get id() {
        return this.#id;
    }
    #bindingManager; // parent binding manager
    get bindingManager() {
        return this.#bindingManager;
    }
    #nodeProperty;
    get nodeProperty() {
        return this.#nodeProperty;
    }
    #stateProperty;
    get stateProperty() {
        return this.#stateProperty;
    }
    // todo: componentの型を指定する
    get component() {
        return this.#bindingManager.component;
    }
    // todo: loopContextの型を指定する
    // new loop context
    get loopContext() {
        return this.#bindingManager.loopContext;
    }
    /** child bindingManager for branch/repeat */
    #children = [];
    get children() {
        return this.#children;
    }
    // branch/repeat is true
    get expandable() {
        return this.nodeProperty.expandable;
    }
    // repeat is true
    get loopable() {
        return this.nodeProperty.loopable;
    }
    /** for select tag value */
    #isSelectValue;
    get isSelectValue() {
        if (typeof this.#isSelectValue === "undefined") {
            this.#isSelectValue = this.nodeProperty.isSelectValue;
        }
        return this.#isSelectValue;
    }
    constructor(bindingManager, node, nodePropertyName, nodePropertyCreator, state, statePropertyName, statePropertyCreator, filters) {
        // assignを呼ぶとbindingManagerなどがundefinedになるので、constructorで初期化
        this.#id = ++seq;
        this.#bindingManager = bindingManager;
        this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, filters);
        this.#stateProperty = statePropertyCreator(this, statePropertyName, filters);
    }
    /**
     * for reuse
     */
    assign(bindingManager, node, nodePropertyName, nodePropertyCreator, statePropertyName, statePropertyConstructor, filters) {
        this.#id = ++seq;
        this.#bindingManager = bindingManager;
        this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, filters);
        this.#stateProperty = statePropertyConstructor(this, statePropertyName, filters);
        return this;
    }
    /**
     * apply value to node
     */
    applyToNode() {
        const { component, nodeProperty, stateProperty } = this;
        component.updator.applyNodeUpdatesByBinding(this, () => {
            if (!nodeProperty.applicable)
                return;
            const filteredViewModelValue = stateProperty.filteredValue ?? "";
            if (nodeProperty.isSameValue(filteredViewModelValue))
                return;
            nodeProperty.value = filteredViewModelValue;
        });
    }
    /**
     * apply value to child nodes
     */
    applyToChildNodes(setOfIndex) {
        const { component } = this;
        component.updator.applyNodeUpdatesByBinding(this, () => {
            this.nodeProperty.applyToChildNodes(setOfIndex);
        });
    }
    /**
     * apply value to State
     */
    applyToState() {
        const { stateProperty, nodeProperty } = this;
        if (!stateProperty.applicable)
            return;
        stateProperty.value = nodeProperty.filteredValue;
    }
    /**
     */
    execDefaultEventHandler(event) {
        if (!(this.component?.bindingSummary.exists(this) ?? false))
            return;
        event.stopPropagation();
        this.component.updator.addProcess(this.applyToState, this, []);
    }
    #defaultEventHandler = undefined;
    get defaultEventHandler() {
        if (typeof this.#defaultEventHandler === "undefined") {
            this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
        }
        return this.#defaultEventHandler;
    }
    /**
     * initialize
     */
    initialize() {
        this.nodeProperty.initialize();
        this.stateProperty.initialize();
    }
    /**
     */
    appendChild(bindingManager) {
        if (!this.expandable)
            utils.raise("Binding.appendChild: not expandable");
        const lastChild = this.children[this.children.length - 1];
        this.children.push(bindingManager);
        const parentNode = this.nodeProperty.node.parentNode;
        const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
        parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
    }
    /**
     */
    replaceChild(index, bindingManager) {
        if (!this.expandable)
            utils.raise("Binding.replaceChild: not expandable");
        const lastChild = this.children[index - 1];
        this.children[index] = bindingManager;
        const parentNode = this.nodeProperty.node.parentNode;
        const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
        parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
    }
    dispose() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].dispose();
        }
        this.children.length = 0;
        this.nodeProperty.dispose();
        this.stateProperty.dispose();
        this.component.bindingSummary.delete(this);
    }
    /**
     * create Binding
     */
    static create(bindingManager, node, nodePropertyName, nodePropertyCreator, statePropertyName, statePropertyCreator, filters) {
        const binding = Reflect.construct(Binding, [bindingManager,
            node, nodePropertyName, nodePropertyCreator,
            statePropertyName, statePropertyCreator,
            filters]);
        binding.initialize();
        return binding;
    }
}
const filterElement = (node) => node.nodeType === Node.ELEMENT_NODE;
class BindingManager {
    // todo: componentの型を指定する
    #component;
    get component() {
        return this.#component;
    }
    #bindings = [];
    get bindings() {
        return this.#bindings;
    }
    #nodes = [];
    get nodes() {
        return this.#nodes ?? [];
    }
    get elements() {
        return this.nodes.filter(filterElement);
    }
    get lastNode() {
        return this.nodes[this.nodes.length - 1];
    }
    #fragment = document.createDocumentFragment();
    get fragment() {
        return this.#fragment;
    }
    set fragment(value) {
        this.#fragment = value;
    }
    #loopContext;
    get loopContext() {
        return this.#loopContext;
    }
    #template;
    get template() {
        return this.#template;
    }
    #parentBinding;
    get parentBinding() {
        return this.#parentBinding;
    }
    set parentBinding(value) {
        this.#parentBinding = value;
    }
    // todo: BindingSummaryの型を指定する
    #bindingSummary;
    #uuid;
    get uuid() {
        return this.#uuid;
    }
    constructor(component, template, uuid, parentBinding) {
        this.#parentBinding = parentBinding;
        this.#component = component;
        this.#template = template;
        this.#loopContext = new LoopContext(this);
        this.#bindingSummary = component.bindingSummary;
        this.#uuid = uuid;
        return this;
    }
    /**
     * for reuse
     */
    assign(component, template, uuid, parentBinding) {
        this.#parentBinding = parentBinding;
        this.#component = component;
        this.#template = template;
        this.#loopContext = new LoopContext(this);
        this.#bindingSummary = component.bindingSummary;
        this.#uuid = uuid;
        return this;
    }
    /**
     *
     */
    initialize() {
        const binder = Binder.create(this.#template, this.#component.useKeyed);
        this.#fragment = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
        this.#bindings = binder.createBindings(this.#fragment, this);
        this.#nodes = Array.from(this.#fragment.childNodes);
    }
    /**
     * register bindings to summary
     */
    registerBindingsToSummary() {
        for (let i = 0; i < this.#bindings.length; i++) {
            this.#bindingSummary.add(this.#bindings[i]);
        }
    }
    postCreate() {
        this.registerBindingsToSummary();
        this.applyToNode();
    }
    /**
     * apply value to node
     */
    applyToNode() {
        // apply value to node exluding select tag, and apply select tag value
        const selectBindings = [];
        for (let i = 0; i < this.#bindings.length; i++) {
            const binding = this.#bindings[i];
            if (binding.isSelectValue) {
                selectBindings.push(binding);
            }
            else {
                binding.applyToNode();
            }
        }
        for (let i = 0; i < selectBindings.length; i++) {
            selectBindings[i].applyToNode();
        }
    }
    /**
     * apply value to ViewModel
     */
    applyToState() {
        for (let i = 0; i < this.#bindings.length; i++) {
            this.#bindings[i].applyToState();
        }
    }
    /**
     * remove nodes, append to fragment
     */
    removeNodes() {
        for (let i = 0; i < this.#nodes.length; i++) {
            this.#fragment?.appendChild(this.#nodes[i]);
        }
    }
    /**
     *
     */
    dispose() {
        this.removeNodes(); // append nodes to fragment
        for (let i = 0; i < this.bindings.length; i++) {
            this.bindings[i].dispose();
        }
        const uuid = this.#uuid;
        this.#parentBinding = undefined;
        this.#component = undefined;
        this.#bindingSummary = undefined;
        BindingManager._cache[uuid]?.push(this) ??
            (BindingManager._cache[uuid] = [this]);
    }
    static _cache = {};
    /**
     * create BindingManager
     */
    static create(component, template, uuid, parentBinding) {
        let bindingManager = this._cache[uuid]?.pop()?.assign(component, template, uuid, parentBinding);
        if (typeof bindingManager === "undefined") {
            bindingManager = new BindingManager(component, template, uuid, parentBinding);
            bindingManager.initialize();
        }
        Popover.initialize(bindingManager);
        return bindingManager;
    }
}

const pickKey = (binding) => binding.stateProperty.key;
const filterExpandableBindings = (binding) => binding.nodeProperty.expandable;
const filerComponentBindings = (binding) => binding.nodeProperty.constructor === ComponentProperty;
/**
 * BindingSummary
 */
class BindingSummary {
    #updated = false;
    get updated() {
        return this.#updated;
    }
    set updated(value) {
        this.#updated = value;
    }
    #updating = false;
    #updateRevision = 0;
    get updateRevision() {
        return this.#updateRevision;
    }
    // viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す 
    #bindingsByKey = new Map; // Object<string,Binding[]>：16ms、Map<string,Binding[]>：9.2ms
    get bindingsByKey() {
        if (this.#updating)
            utils.raise("BindingSummary.bindingsByKey can only be called after BindingSummary.update()");
        return this.#bindingsByKey;
    }
    // if/loopを持つbinding
    #expandableBindings = new Set;
    get expandableBindings() {
        if (this.#updating)
            utils.raise("BindingSummary.expandableBindings can only be called after BindingSummary.update()");
        return this.#expandableBindings;
    }
    // componentを持つbinding
    #componentBindings = new Set;
    get componentBindings() {
        if (this.#updating)
            utils.raise("BindingSummary.componentBindings can only be called after BindingSummary.update()");
        return this.#componentBindings;
    }
    // 全binding
    #allBindings = new Set;
    get allBindings() {
        return this.#allBindings;
    }
    add(binding) {
        if (!this.#updating)
            utils.raise("BindingSummary.add() can only be called in BindingSummary.update()");
        this.#updated = true;
        this.#allBindings.add(binding);
    }
    delete(binding) {
        if (!this.#updating)
            utils.raise("BindingSummary.delete() can only be called in BindingSummary.update()");
        this.#updated = true;
        this.#allBindings.delete(binding);
    }
    exists(binding) {
        return this.#allBindings.has(binding);
    }
    flush() {
        config.debug && performance.mark('BindingSummary.flush:start');
        try {
            this.rebuild(this.#allBindings);
        }
        finally {
            if (config.debug) {
                performance.mark('BindingSummary.flush:end');
                performance.measure('BindingSummary.flush', 'BindingSummary.flush:start', 'BindingSummary.flush:end');
                console.log(performance.getEntriesByType("measure"));
                performance.clearMeasures('BindingSummary.flush');
                performance.clearMarks('BindingSummary.flush:start');
                performance.clearMarks('BindingSummary.flush:end');
            }
        }
    }
    update(callback) {
        this.#updating = true;
        this.#updated = false;
        this.#updateRevision++;
        try {
            callback(this);
        }
        finally {
            if (this.#updated)
                this.flush();
            this.#updating = false;
        }
    }
    rebuild(bindings) {
        this.#allBindings = bindings;
        const arrayBindings = Array.from(bindings);
        this.#bindingsByKey = Map.groupBy(arrayBindings, pickKey);
        this.#expandableBindings = new Set(arrayBindings.filter(filterExpandableBindings));
        this.#componentBindings = new Set(arrayBindings.filter(filerComponentBindings));
    }
}

const getPropAccessKey = (prop) => prop.patternName + "\t" + prop.indexes.toString();
const executeProcess = (process) => async () => Reflect.apply(process.target, process.thisArgument, process.argumentList);
const compareExpandableBindings = (a, b) => a.stateProperty.patternName.level - b.stateProperty.patternName.level;
class Updator {
    component;
    processQueue = [];
    updatedStateProperties = [];
    expandedStateProperties = [];
    updatedBindings = new Set();
    executing = false;
    constructor(component) {
        this.component = component;
    }
    addProcess(target, thisArgument, argumentList) {
        this.processQueue.push({ target, thisArgument, argumentList });
        if (this.executing)
            return;
        this.exec();
    }
    getProcessQueue() {
        return this.processQueue;
    }
    addUpdatedStateProperty(prop) {
        this.updatedStateProperties.push(prop);
    }
    /**
     *
     * @param {{ component:Component, processQueue:Process[], updatedStateProperties:PropertyAccess[] }} param0
     * @returns {Promise<PropertyAccess[]>}
     */
    async process() {
        const totalUpdatedStateProperties = [];
        // event callback, and update state
        while (this.processQueue.length > 0) {
            const processes = this.processQueue.slice(0);
            this.processQueue.length = 0;
            for (let i = 0; i < processes.length; i++) {
                await this.component.stateWritable(executeProcess(processes[i]));
            }
            if (this.updatedStateProperties.length > 0) {
                // call updatedCallback, and add processQeueue
                this.component.writableState[UpdatedCallbackSymbol](this.updatedStateProperties);
                totalUpdatedStateProperties.push(...this.updatedStateProperties);
                this.updatedStateProperties.length = 0;
            }
        }
        // cache clear
        this.component.readonlyState[ClearCacheApiSymbol]();
        return totalUpdatedStateProperties;
    }
    expandStateProperties(updatedStateProperties) {
        // expand state properties
        const expandedStateProperties = updatedStateProperties.slice(0);
        for (let i = 0; i < updatedStateProperties.length; i++) {
            expandedStateProperties.push(...StateBaseHandler.makeNotifyForDependentProps(this.component.readonlyState, updatedStateProperties[i]));
        }
        return expandedStateProperties;
    }
    rebuildBinding(expandedStatePropertyByKey) {
        // bindingの再構築
        // 再構築するのは、更新したプロパティのみでいいかも→ダメだった。
        // expandedStatePropertyByKeyに、branch、repeatが含まれている場合、それらのbindingを再構築する
        // 再構築する際、branch、repeatの子ノードは更新する
        // 構築しなおす順番は、プロパティのパスの浅いものから行う(ソートをする)
        const component = this.component;
        const bindingSummary = component.bindingSummary;
        const expandableBindings = Array.from(bindingSummary.expandableBindings).toSorted(compareExpandableBindings);
        bindingSummary.update((bindingSummary) => {
            for (let i = 0; i < expandableBindings.length; i++) {
                const binding = expandableBindings[i];
                if (!bindingSummary.exists(binding))
                    continue;
                if (expandedStatePropertyByKey.has(binding.stateProperty.key)) {
                    binding.applyToNode();
                }
            }
        });
    }
    updateChildNodes(expandedStateProperties) {
        const component = this.component;
        const bindingSummary = component.bindingSummary;
        const setOfIndexByParentKey = new Map;
        for (const propertyAccess of expandedStateProperties) {
            if (propertyAccess.patternNameInfo.lastPathName !== "*")
                continue;
            const lastIndex = propertyAccess.indexes?.at(-1);
            if (typeof lastIndex === "undefined")
                continue;
            const parentKey = propertyAccess.patternNameInfo.parentPath + "\t" + propertyAccess.indexes.slice(0, -1);
            setOfIndexByParentKey.get(parentKey)?.add(lastIndex) ?? setOfIndexByParentKey.set(parentKey, new Set([lastIndex]));
        }
        for (const [parentKey, setOfIndex] of setOfIndexByParentKey.entries()) {
            const bindings = bindingSummary.bindingsByKey.get(parentKey) ?? utils.raise(`binding not found: ${parentKey}`);
            for (const binding of bindings) {
                binding.applyToChildNodes(setOfIndex);
            }
        }
    }
    updateNode(expandedStatePropertyByKey) {
        const component = this.component;
        const bindingSummary = component.bindingSummary;
        const selectBindings = [];
        for (const key of expandedStatePropertyByKey.keys()) {
            const bindings = bindingSummary.bindingsByKey.get(key);
            if (typeof bindings === "undefined")
                continue;
            for (let i = 0; i < bindings.length; i++) {
                const binding = bindings[i];
                binding.isSelectValue ? selectBindings.push(binding) : binding.applyToNode();
            }
        }
        for (let i = 0; i < selectBindings.length; i++) {
            selectBindings[i].applyToNode();
        }
        for (const binding of bindingSummary.componentBindings) {
            //if (updatedBindings.has(binding)) continue;
            binding.nodeProperty.postUpdate(expandedStatePropertyByKey);
        }
    }
    async execCallback(callback) {
        this.executing = true;
        config.debug && performance.mark('Updator.exec:start');
        try {
            await callback();
        }
        finally {
            if (config.debug) {
                performance.mark('Updator.exec:end');
                performance.measure('Updator.exec', 'Updator.exec:start', 'Updator.exec:end');
                console.log(performance.getEntriesByType("measure"));
                performance.clearMeasures('Updator.exec');
                performance.clearMarks('Updator.exec:start');
                performance.clearMarks('Updator.exec:end');
            }
            this.executing = false;
        }
    }
    async exec() {
        await this.execCallback(async () => {
            while (this.getProcessQueue().length > 0) {
                this.updatedBindings.clear();
                this.component.contextRevision++;
                const updatedStateProperties = await this.process();
                const expandedStateProperties = this.expandStateProperties(updatedStateProperties);
                const expandedStatePropertyByKey = new Map(expandedStateProperties.map(prop => [getPropAccessKey(prop), prop]));
                this.rebuildBinding(expandedStatePropertyByKey);
                this.updateChildNodes(expandedStateProperties);
                this.updateNode(expandedStatePropertyByKey);
            }
        });
    }
    applyNodeUpdatesByBinding(binding, callback) {
        if (this.updatedBindings.has(binding))
            return;
        try {
            callback(this);
        }
        finally {
            this.updatedBindings.add(binding);
        }
    }
}

const getPopoverContextIndexes = (component) => {
    const id = component.id;
    return component.parentComponent?.popoverContextIndexesById?.get(id);
};
const contextLoopIndexes = (handler, props) => {
    let indexes;
    const propName = getPatternNameInfo(props.name);
    if (propName.level > 0 && props.indexes.length === 0 && handler.component.hasAttribute("popover")) {
        indexes = getPopoverContextIndexes(handler.component)?.slice(0, propName.level);
    }
    return indexes ?? props.indexes;
};
class Handler {
    constructor(component) {
        this.#component = component;
    }
    #component;
    get component() {
        return this.#component;
    }
    #buffer;
    get buffer() {
        return this.#buffer;
    }
    #binds = [];
    get binds() {
        return this.#binds;
    }
    #saveBindProperties = {};
    /**
     * bind parent component's property
     * @param {string} prop
     * @param {{name:string,indexes:number[]}|undefined} propAccess
     */
    #bindProperty(prop, propAccess) {
        const getFunc = (handler, name, props) => function () {
            if (typeof handler.buffer !== "undefined") {
                return handler.buffer[name];
            }
            else {
                if (typeof props === "undefined")
                    utils.raise(`PropertyAccess is required`);
                const match = RE_CONTEXT_INDEX.exec(props.name);
                if (match) {
                    const loopIndex = Number(match[1]) - 1;
                    let indexes = props.loopContext.indexes;
                    if (indexes.length === 0 && handler.component.hasAttribute("popover")) {
                        indexes = getPopoverContextIndexes(handler.component) ?? [];
                    }
                    return indexes[loopIndex];
                }
                else {
                    const loopIndexes = contextLoopIndexes(handler, props);
                    return handler.component.parentComponent.readonlyState[GetDirectSymbol](props.name, loopIndexes);
                }
            }
        };
        /**
         * return parent component's property setter function
         */
        const setFunc = (handler, name, props) => function (value) {
            if (typeof handler.buffer !== "undefined") {
                handler.buffer[name] = value;
            }
            else {
                if (typeof props === "undefined")
                    utils.raise(`PropertyAccess is required`);
                const loopIndexes = contextLoopIndexes(handler, props);
                handler.component.parentComponent.writableState[SetDirectSymbol](props.name, loopIndexes, value);
            }
            return true;
        };
        // save
        this.#saveBindProperties[prop] = Object.getOwnPropertyDescriptor(this.#component.baseState, prop) ?? {
            value: undefined,
            writable: true,
            enumerable: true,
            configurable: true,
        };
        // define component's property
        Object.defineProperty(this.#component.baseState, prop, {
            get: getFunc(this, prop, propAccess),
            set: setFunc(this, prop, propAccess),
            configurable: true,
            enumerable: true,
        });
        if (typeof propAccess !== "undefined") {
            this.#binds.push({ prop, propAccess });
        }
    }
    #setBuffer(buffer) {
        this.#buffer = buffer;
        for (const key in buffer) {
            this.#bindProperty(key);
            this.#component.currentState[NotifyForDependentPropsApiSymbol](key, []);
        }
    }
    #getBuffer() {
        return this.#buffer;
    }
    #clearBuffer() {
        this.#buffer = undefined;
    }
    #createBuffer() {
        let buffer;
        buffer = this.#component.parentComponent.readonlyState[CreateBufferApiSymbol](this.#component);
        if (typeof buffer !== "undefined") {
            return buffer;
        }
        buffer = {};
        this.#binds.forEach(({ prop, propAccess }) => {
            const loopIndexes = contextLoopIndexes(this, propAccess);
            buffer[prop] = this.#component.parentComponent.readonlyState[GetDirectSymbol](propAccess.name, loopIndexes);
        });
        return buffer;
    }
    #flushBuffer() {
        if (typeof this.#buffer !== "undefined") {
            const buffer = this.#buffer;
            const result = this.#component.parentComponent.writableState[FlushBufferApiSymbol](buffer, this.#component);
            if (result !== true) {
                this.#binds.forEach(({ prop, propAccess }) => {
                    const loopIndexes = contextLoopIndexes(this, propAccess);
                    this.#component.parentComponent.writableState[SetDirectSymbol](propAccess.name, loopIndexes, buffer[prop]);
                });
            }
        }
    }
    #clear() {
        this.#buffer = undefined;
        this.#binds = [];
        for (const [key, desc] of Object.entries(this.#saveBindProperties)) {
            Object.defineProperty(this.#component.baseState, key, desc);
        }
        this.#saveBindProperties = {};
    }
    /**
     * Proxy.get
     */
    get(target, prop, receiver) {
        if (prop === BindPropertySymbol) {
            return (prop, propAccess) => this.#bindProperty(prop, propAccess);
        }
        else if (prop === SetBufferSymbol) {
            return (buffer) => this.#setBuffer(buffer);
        }
        else if (prop === GetBufferSymbol) {
            return () => this.#getBuffer();
        }
        else if (prop === ClearBufferSymbol) {
            return () => this.#clearBuffer();
        }
        else if (prop === CreateBufferSymbol) {
            return () => this.#createBuffer();
        }
        else if (prop === FlushBufferSymbol) {
            return () => this.#flushBuffer();
        }
        else if (prop === ClearSymbol) {
            return () => this.#clear();
        }
        return this.#component.currentState[prop];
    }
    set(target, prop, value, receiver) {
        this.#component.writableState[prop] = value;
        return true;
    }
    /**
     * Proxy.ownKeys
     */
    ownKeys(target) {
        if (typeof this.buffer !== "undefined") {
            return Reflect.ownKeys(this.buffer);
        }
        else {
            return this.#binds.map(({ prop }) => prop);
        }
    }
    /**
     * Proxy.getOwnPropertyDescriptor
     */
    getOwnPropertyDescriptor(target, prop) {
        return {
            enumerable: true,
            configurable: true
            /* ...other flags, probable "value:..."" */
        };
    }
}
function createProps(component) {
    return new Proxy({}, new Handler(component));
}

const BoundByComponentSymbol = Symbol.for(`globalData.boundByComponent`);

class GlobalDataHandler extends Handler$1 {
    #setOfComponentByProp = new Map;
    /**
     *
     * @param {any} target
     * @param {string|Symbol} prop
     * @param {any} receiver
     * @returns
     */
    get(target, prop, receiver) {
        if (prop === BoundByComponentSymbol) {
            return (component, prop) => {
                let setOfComponent = this.#setOfComponentByProp.get(prop);
                if (typeof setOfComponent === "undefined") {
                    this.#setOfComponentByProp.set(prop, new Set([component]));
                }
                else {
                    setOfComponent.add(component);
                }
            };
        }
        return super.get(target, prop, receiver);
    }
    set(target, prop, value, receiver) {
        if (typeof prop !== "string")
            return Reflect.set(target, prop, value, receiver);
        const { name, indexes } = getPropertyNameInfo(prop);
        const result = receiver[SetDirectSymbol](name, indexes, value);
        let setOfComponent = this.#setOfComponentByProp.get(name);
        if (setOfComponent) {
            for (const component of setOfComponent) {
                component.currentState[NotifyForDependentPropsApiSymbol]("$globals." + name, indexes);
            }
        }
        return result;
    }
}
class GlobalData {
    static create(data = {}) {
        return new Proxy(data, new GlobalDataHandler);
    }
    static #data = this.create();
    static get data() {
        return this.#data;
    }
    static set data(data) {
        this.#data = this.create(data);
    }
}

class ComponentGlobalDataHandler extends Handler$1 {
    #component;
    setOfProps = new Set;
    constructor(component) {
        super();
        this.#component = component;
    }
    /**
     * プロパティをバインドする
     */
    bindProperty(prop) {
        GlobalData.data[BoundByComponentSymbol](this.#component, prop);
        this.setOfProps.add(prop);
    }
    directGet = (name, indexes) => {
        if (!this.setOfProps.has(name)) {
            this.bindProperty(name);
        }
        return GlobalData.data[GetDirectSymbol](name, indexes);
    };
    directSet = (name, indexes, value) => {
        if (!this.setOfProps.has(name)) {
            this.bindProperty(name);
        }
        return GlobalData.data[SetDirectSymbol](name, indexes, value);
    };
    /**
     *
     * @param {any} target
     * @param {string} prop
     * @param {Proxy<Handler>} receiver
     * @returns
     */
    get(target, prop, receiver) {
        if (prop === GetDirectSymbol) {
            return this.directGet;
        }
        else if (prop === SetDirectSymbol) {
            return this.directSet;
        }
        if (typeof prop !== "string")
            return Reflect.get(target, prop, receiver);
        const { patternName, indexes } = getPropertyNameInfo(prop);
        return this.directGet(patternName, indexes);
    }
    set(target, prop, value, receiver) {
        if (typeof prop !== "string")
            return Reflect.set(target, prop, value, receiver);
        const { patternName, indexes } = getPropertyNameInfo(prop);
        return this.directSet(patternName, indexes, value);
    }
}
function createGlobals(component) {
    return new Proxy({}, new ComponentGlobalDataHandler(component));
}

const pseudoComponentByNode = new Map;
const getParentComponent = (_node) => {
    do {
        let node = _node.parentNode;
        if (node == null)
            return undefined;
        if (Reflect.get(node, "isQuelComponent"))
            return node;
        if (node instanceof ShadowRoot) {
            if (Reflect.get(node.host, "isQuelComponent"))
                return node.host;
            node = node.host;
        }
        const component = pseudoComponentByNode.get(node);
        if (typeof component !== "undefined")
            return component;
    } while (true);
};
const localStyleSheetByTagName = new Map;
function CustomComponent(Base) {
    return class extends Base {
        constructor(...args) {
            super();
            const component = this.component;
            this.#states = getProxies(component, component.State); // create view model
            this.#bindingSummary = new BindingSummary;
            this.#initialPromises = Promise.withResolvers(); // promises for initialize
            this.#updator = new Updator(component);
            this.#props = createProps(component);
            this.#globals = createGlobals(component);
        }
        //#globals;
        #states;
        get states() {
            return this.#states;
        }
        get component() {
            return this;
        }
        #parentComponent;
        get parentComponent() {
            if (typeof this.#parentComponent === "undefined") {
                this.#parentComponent = getParentComponent(this.component);
            }
            return this.#parentComponent;
        }
        #initialPromises;
        get initialPromises() {
            return this.#initialPromises;
        }
        #alivePromises;
        get alivePromises() {
            return this.#alivePromises ?? utils.raise("alivePromises is undefined");
        }
        set alivePromises(promises) {
            this.#alivePromises = promises;
        }
        get baseState() {
            return this.#states.base;
        }
        get writableState() {
            return this.#states.write;
        }
        get readonlyState() {
            return this.#states.readonly;
        }
        get currentState() {
            return this.isWritable ? this.writableState : this.readonlyState;
        }
        #rootBindingManager;
        get rootBindingManager() {
            return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
        }
        set rootBindingManager(bindingManager) {
            this.#rootBindingManager = bindingManager;
        }
        get viewRootElement() {
            const component = this.component;
            return component.useWebComponent ? (component.shadowRoot ?? component) : component.pseudoParentNode;
        }
        // alias view root element */
        get queryRoot() {
            return this.viewRootElement;
        }
        // parent node（use, case of useWebComponent is false）
        #pseudoParentNode;
        get pseudoParentNode() {
            const component = this.component;
            return !component.useWebComponent ?
                (this.#pseudoParentNode ?? utils.raise("pseudoParentNode is undefined")) :
                utils.raise("mixInComponent: useWebComponent must be false");
        }
        set pseudoParentNode(node) {
            this.#pseudoParentNode = node;
        }
        // pseudo node（use, case of useWebComponent is false） */
        #pseudoNode;
        get pseudoNode() {
            return this.#pseudoNode ?? utils.raise("pseudoNode is undefined");
        }
        set pseudoNode(node) {
            this.#pseudoNode = node;
        }
        #isWritable = false;
        get isWritable() {
            return this.#isWritable;
        }
        async stateWritable(callback) {
            this.#isWritable = true;
            try {
                await callback();
            }
            finally {
                this.#isWritable = false;
            }
        }
        #cachableInBuilding = false;
        get cachableInBuilding() {
            return this.#cachableInBuilding;
        }
        cacheInBuilding(callback) {
            this.#cachableInBuilding = true;
            try {
                callback(this.component);
            }
            finally {
                this.#cachableInBuilding = false;
            }
        }
        // find parent shadow root, or document, for adoptedCSS 
        get shadowRootOrDocument() {
            const component = this.component;
            let node = component.parentNode;
            while (node) {
                if (node instanceof ShadowRoot) {
                    return node;
                }
                node = node.parentNode;
            }
            return document;
        }
        #contextRevision = 0;
        get contextRevision() {
            return this.#contextRevision;
        }
        set contextRevision(value) {
            this.#contextRevision = value;
        }
        useContextRevision(callback) {
            this.#contextRevision++;
            callback(this.#contextRevision);
        }
        #bindingSummary;
        get bindingSummary() {
            return this.#bindingSummary;
        }
        #updator;
        get updator() {
            return this.#updator;
        }
        #props;
        get props() {
            return this.#props;
        }
        #globals;
        get globals() {
            return this.#globals;
        }
        async build() {
            const component = this.component;
            if (isAttachable(component.tagName.toLowerCase()) && component.useShadowRoot && component.useWebComponent) {
                const shadowRoot = component.attachShadow({ mode: 'open' });
                const names = getNamesFromComponent(component);
                const styleSheets = getStyleSheetList(names);
                if (typeof component.styleSheet !== "undefined") {
                    styleSheets.push(component.styleSheet);
                }
                shadowRoot.adoptedStyleSheets = styleSheets;
            }
            else {
                if (typeof component.styleSheet !== "undefined") {
                    let adoptedStyleSheet = component.styleSheet;
                    if (component.useLocalSelector) {
                        const localStyleSheet = localStyleSheetByTagName.get(component.tagName);
                        if (typeof localStyleSheet !== "undefined") {
                            adoptedStyleSheet = localStyleSheet;
                        }
                        else {
                            adoptedStyleSheet = localizeStyleSheet(component.styleSheet, component.selectorName);
                            localStyleSheetByTagName.set(component.tagName, adoptedStyleSheet);
                        }
                    }
                    const shadowRootOrDocument = component.shadowRootOrDocument;
                    const adoptedStyleSheets = Array.from(shadowRootOrDocument.adoptedStyleSheets);
                    if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
                        shadowRootOrDocument.adoptedStyleSheets = [...adoptedStyleSheets, adoptedStyleSheet];
                    }
                }
            }
            if (component.useOverscrollBehavior) {
                if (component.tagName === "DIALOG" || component.hasAttribute("popover")) {
                    component.style.overscrollBehavior = "contain";
                }
            }
            await component.currentState[ConnectedCallbackSymbol]();
            component.cacheInBuilding((component) => {
                // build binding tree and dom 
                component.bindingSummary.update((summary) => {
                    const uuid = component.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
                    component.rootBindingManager = BindingManager.create(component, component.template, uuid);
                    component.rootBindingManager.postCreate();
                });
                if (component.useWebComponent) {
                    // case of useWebComponent,
                    // then append fragment block to viewRootElement
                    component.viewRootElement.appendChild(component.rootBindingManager.fragment);
                }
                else {
                    // case of no useWebComponent, 
                    // then insert fragment block before pseudo node nextSibling
                    component.viewRootElement.insertBefore(component.rootBindingManager.fragment, component.pseudoNode.nextSibling);
                    // child nodes add pseudoComponentByNode
                    component.rootBindingManager.nodes.forEach(node => pseudoComponentByNode.set(node, component));
                }
            });
        }
        async connectedCallback() {
            const component = this.component;
            try {
                // wait for parent component initialize
                if (this.parentComponent) {
                    await this.parentComponent.initialPromises.promise;
                }
                else {
                }
                if (!component.useWebComponent) {
                    // case of no useWebComponent
                    const comment = document.createComment(`@@/${component.tagName}`);
                    component.pseudoParentNode = component.parentNode ?? utils.raise("parentNode is undefined");
                    component.pseudoNode = comment;
                    component.pseudoParentNode.replaceChild(comment, component);
                }
                // promises for alive
                component.alivePromises = Promise.withResolvers();
                await this.build();
            }
            finally {
                this.initialPromises?.resolve && this.initialPromises.resolve();
            }
        }
        async disconnectedCallback() {
        }
    };
}

function DialogComponent(Base) {
    return class extends Base {
        #dialogPromises;
        get dialogPromises() {
            return this.#dialogPromises;
        }
        set dialogPromises(value) {
            this.#dialogPromises = value;
        }
        #returnValue = "";
        get returnValue() {
            return this.#returnValue;
        }
        set returnValue(value) {
            this.#returnValue = value;
        }
        get useBufferedBind() {
            const component = this.#component;
            return component.hasAttribute("buffered-bind");
        }
        get #component() {
            return this;
        }
        constructor(...args) {
            super();
            const component = this.#component;
            component.addEventListener("closed", () => {
                if (typeof component.dialogPromises !== "undefined") {
                    if (component.returnValue === "") {
                        component.dialogPromises.reject();
                    }
                    else {
                        const buffer = component.props[GetBufferSymbol]();
                        component.props[ClearBufferSymbol]();
                        component.dialogPromises.resolve(buffer);
                    }
                    component.dialogPromises = undefined;
                }
                if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
                    if (component.returnValue !== "") {
                        component.props[FlushBufferSymbol]();
                    }
                }
            });
            component.addEventListener("close", () => {
                const closedEvent = new CustomEvent("closed");
                component.dispatchEvent(closedEvent);
            });
        }
        async #show(props, modal = true) {
            const component = this.#component;
            component.returnValue = "";
            component.dialogPromises = Promise.withResolvers();
            component.props[SetBufferSymbol](props);
            if (modal) {
                HTMLDialogElement.prototype.showModal.apply(component);
            }
            else {
                HTMLDialogElement.prototype.show.apply(component);
            }
            return component.dialogPromises.promise;
        }
        async asyncShowModal(props) {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: asyncShowModal is only for HTMLDialogElement");
            }
            return this.#show(props, true);
        }
        async asyncShow(props) {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: asyncShow is only for HTMLDialogElement");
            }
            return this.#show(props, false);
        }
        showModal() {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: showModal is only for HTMLDialogElement");
            }
            const component = this.#component;
            if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
                component.returnValue = "";
                const buffer = component.props[CreateBufferSymbol]();
                component.props[SetBufferSymbol](buffer);
            }
            return HTMLDialogElement.prototype.showModal.apply(component);
        }
        show() {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: show is only for HTMLDialogElement");
            }
            const component = this.#component;
            if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
                component.returnValue = "";
                const buffer = component.props[CreateBufferSymbol]();
                component.props[SetBufferSymbol](buffer);
            }
            return HTMLDialogElement.prototype.show.apply(component);
        }
        close(returnValue = "") {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: close is only for HTMLDialogElement");
            }
            const component = this.#component;
            return HTMLDialogElement.prototype.close.apply(component, [returnValue]);
        }
    };
}

function PopoverComponent(Base) {
    return class extends Base {
        #canceled = false;
        get canceled() {
            return this.#canceled;
        }
        set canceled(value) {
            this.#canceled = value;
        }
        #popoverPromises;
        get popoverPromises() {
            return this.#popoverPromises;
        }
        set popoverPromises(value) {
            this.#popoverPromises = value;
        }
        #popoverContextIndexesById;
        get popoverContextIndexesById() {
            if (typeof this.#popoverContextIndexesById === "undefined") {
                this.#popoverContextIndexesById = new Map;
            }
            return this.#popoverContextIndexesById;
        }
        get #component() {
            return this;
        }
        constructor(...args) {
            super();
            const component = this.#component;
            component.addEventListener("hidden", () => {
                if (typeof component.popoverPromises !== "undefined") {
                    if (component.canceled) {
                        component.popoverPromises.reject();
                    }
                    else {
                        const buffer = component.props[GetBufferSymbol]();
                        component.props[ClearBufferSymbol]();
                        component.popoverPromises.resolve(buffer);
                    }
                    component.popoverPromises = undefined;
                }
                if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
                    if (!component.canceled) {
                        component.props[FlushBufferSymbol]();
                    }
                }
                component.canceled = true;
                // remove loop context
                const id = component.id;
                if (typeof id !== "undefined") {
                    component.popoverContextIndexesById.delete(id);
                }
            });
            component.addEventListener("shown", () => {
                component.canceled = true;
                if (component.useBufferedBind && typeof component.parentComponent !== "undefined") {
                    const buffer = component.props[CreateBufferSymbol]();
                    component.props[SetBufferSymbol](buffer);
                }
                for (const key in component.props) {
                    component.currentState[NotifyForDependentPropsApiSymbol](key, []);
                }
            });
            component.addEventListener("toggle", (e) => {
                const toggleEvent = e;
                if (toggleEvent.newState === "closed") {
                    const hiddenEvent = new CustomEvent("hidden");
                    component.dispatchEvent(hiddenEvent);
                }
                else if (toggleEvent.newState === "open") {
                    const shownEvent = new CustomEvent("shown");
                    component.dispatchEvent(shownEvent);
                }
            });
        }
        async asyncShowPopover(props) {
            const component = this.#component;
            component.popoverPromises = Promise.withResolvers();
            component.props[SetBufferSymbol](props);
            HTMLElement.prototype.showPopover.apply(component);
            return component.popoverPromises.promise;
        }
        hidePopover() {
            const component = this.#component;
            component.canceled = false;
            HTMLElement.prototype.hidePopover.apply(component);
        }
        cancelPopover() {
            const component = this.#component;
            HTMLElement.prototype.hidePopover.apply(component);
        }
    };
}

const moduleByConstructor = new Map;
const customElementInfoByTagName = new Map;
const filterManagersByTagName = new Map;
/**
 * generate unique component class
 */
const generateComponentClass = (componentModule) => {
    const getBaseClass = function (module, baseConstructor) {
        const baseClass = class extends baseConstructor {
            #module;
            get module() {
                if (typeof this.#module === "undefined") {
                    this.#module = moduleByConstructor.get(this.constructor) ?? utils.raise(`module is not found for ${this.constructor.name}`);
                }
                return this.#module;
            }
            get isQuelComponent() {
                return true;
            }
            #customElementInfo;
            get customElementInfo() {
                if (typeof this.#customElementInfo === "undefined") {
                    this.#customElementInfo = customElementInfoByTagName.get(this.tagName) ?? utils.raise(`customElementInfo is not found for ${this.tagName}`);
                }
                return this.#customElementInfo;
            }
            #setCustomElementInfo() {
                const customeElementInfo = customElementInfoByTagName.get(this.tagName);
                if (typeof customeElementInfo === "undefined") {
                    const lowerTagName = this.tagName.toLowerCase();
                    const isAutonomousCustomElement = lowerTagName.includes("-");
                    const customName = this.getAttribute("is");
                    const isCostomizedBuiltInElement = customName ? true : false;
                    const selectorName = isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
                    customElementInfoByTagName.set(this.tagName, { selectorName, lowerTagName, isAutonomousCustomElement, isCostomizedBuiltInElement });
                }
            }
            get template() {
                return this.module.template;
            }
            get styleSheet() {
                return this.module.styleSheet;
            }
            get State() {
                return this.module.State;
            }
            get inputFilters() {
                return this.module.filters.input ?? {};
            }
            get outputFilters() {
                return this.module.filters.output ?? {};
            }
            get eventFilters() {
                return this.module.filters.event ?? {};
            }
            get useShadowRoot() {
                return this.module.moduleConfig.useShadowRoot ?? config.useShadowRoot;
            }
            get useWebComponent() {
                return this.module.moduleConfig.useWebComponent ?? config.useWebComponent;
            }
            get useLocalTagName() {
                return this.module.moduleConfig.useLocalTagName ?? config.useLocalTagName;
            }
            get useKeyed() {
                return this.module.moduleConfig.useKeyed ?? config.useKeyed;
            }
            get useLocalSelector() {
                return this.module.moduleConfig.useLocalSelector ?? config.useLocalSelector;
            }
            get useOverscrollBehavior() {
                return this.module.moduleConfig.useOverscrollBehavior ?? config.useOverscrollBehavior;
            }
            get lowerTagName() {
                return this.customElementInfo.lowerTagName;
            }
            get selectorName() {
                return this.customElementInfo.selectorName;
            }
            // is autonomous custom element 
            get isAutonomousCustomElement() {
                return this.customElementInfo.isAutonomousCustomElement;
            }
            // is costomized built-in element
            get isCostomizedBuiltInElement() {
                return this.customElementInfo.isCostomizedBuiltInElement;
            }
            #filterManagers;
            get filterManagers() {
                if (typeof this.#filterManagers === "undefined") {
                    this.#filterManagers = filterManagersByTagName.get(this.tagName) ?? utils.raise(`filterManagers is not found for ${this.tagName}`);
                }
                return this.#filterManagers;
            }
            #setFilterManagers() {
                const filterManagers = filterManagersByTagName.get(this.tagName);
                if (typeof filterManagers === "undefined") {
                    const filterManagers = {
                        inputFilterManager: new InputFilterManager,
                        outputFilterManager: new OutputFilterManager,
                        eventFilterManager: new EventFilterManager,
                    };
                    for (const [name, filterFunc] of Object.entries(this.inputFilters)) {
                        filterManagers.inputFilterManager.registerFilter(name, filterFunc);
                    }
                    for (const [name, filterFunc] of Object.entries(this.outputFilters)) {
                        filterManagers.outputFilterManager.registerFilter(name, filterFunc);
                    }
                    for (const [name, filterFunc] of Object.entries(this.eventFilters)) {
                        filterManagers.eventFilterManager.registerFilter(name, filterFunc);
                    }
                    filterManagersByTagName.set(this.tagName, filterManagers);
                }
            }
            get inputFilterManager() {
                return this.filterManagers.inputFilterManager;
            }
            get outputFilterManager() {
                return this.filterManagers.outputFilterManager;
            }
            get eventFilterManager() {
                return this.filterManagers.eventFilterManager;
            }
            constructor() {
                super();
                this.#setCustomElementInfo();
                this.#setFilterManagers();
            }
            static baseClass = baseConstructor;
            get baseClass() {
                return Reflect.get(this.constructor, "baseClass");
            }
        };
        moduleByConstructor.set(baseClass, module);
        return baseClass;
    };
    const module = Object.assign(new Module, componentModule);
    module.filters = Object.assign({}, componentModule.filters);
    module.config = Object.assign({}, componentModule.moduleConfig);
    module.options = Object.assign({}, componentModule.options);
    const extendsTag = module.config?.extends ?? module.options?.extends;
    const baseConstructor = extendsTag ? document.createElement(extendsTag).constructor : HTMLElement;
    // generate new class, for customElements not define same class
    const componentClass = getBaseClass(module, baseConstructor);
    // mix in component class
    const extendedComponentClass = PopoverComponent(DialogComponent(CustomComponent(componentClass)));
    // register component's subcomponents 
    registerComponentModules(module.componentModulesForRegister ?? {});
    return extendedComponentClass;
};
/**
 * register component class with tag name, call customElements.define
 * generate component class from componentModule
 */
function registerComponentModule(customElementName, componentModule) {
    const customElementKebabName = utils.toKebabCase(customElementName);
    const componentClass = generateComponentClass(componentModule);
    const extendsTag = componentModule.moduleConfig?.extends ?? componentModule.options?.extends;
    if (typeof extendsTag === "undefined") {
        customElements.define(customElementKebabName, componentClass);
    }
    else {
        customElements.define(customElementKebabName, componentClass, { extends: extendsTag });
    }
}
function registerComponentModules(componentModules) {
    for (const [customElementName, userComponentModule] of Object.entries(componentModules)) {
        registerComponentModule(customElementName, userComponentModule);
    }
}

const PREFIX = "*filter-";
function extendOf(module, extendClass) {
    if (typeof module !== "function")
        return false;
    let testClass = module;
    while (testClass) {
        if (testClass === extendClass)
            return true;
        testClass = Object.getPrototypeOf(testClass);
    }
    return false;
}
const QuelLoaderRegistrar = (name, module) => {
    if (name.startsWith(PREFIX)) {
        const filterName = name.slice(PREFIX.length);
        const { output, input, event } = module;
        output && OutputFilterManager.registerFilter(filterName, output);
        input && InputFilterManager.registerFilter(filterName, input);
        event && EventFilterManager.registerFilter(filterName, event);
    }
    else {
        if (extendOf(module, HTMLElement)) {
            customElements.define(name, module);
        }
        else {
            if ("State" in module && "html" in module) {
                registerComponentModule(name, module);
            }
        }
    }
};
const loader = Loader.create(QuelLoaderRegistrar);

const DEFAULT_CONFIG_PATH = "./quel.config.json";
async function bootFromImportMeta(importMeta, configPath) {
    const response = await fetch(importMeta.resolve(configPath ?? DEFAULT_CONFIG_PATH));
    const configData = await response.json();
    for (let [key, value] of Object.entries(config)) {
        config[key] = (typeof configData[key] !== "undefined") ? configData[key] : value;
    }
    await loader.config(configData).load();
}

function importMetaResolve(importMeta, path) {
  return importMeta.resolve(path);
}

function toComment(html) {
    return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
        return `<!--{{${expr}}}-->`;
    });
}
function fromComment(html) {
    return html.replaceAll(/<!--\{\{([^\}]+)\}\}-->/g, (match, expr) => {
        return `{{${expr}}}`;
    });
}
async function loadSingleFileComponent(path) {
    const template = document.createElement("template");
    const response = await fetch(importMetaResolve(import.meta, path));
    template.innerHTML = toComment(await response.text());
    let scriptModule;
    const script = template.content.querySelector("script");
    if (script) {
        scriptModule = await import("data:text/javascript;charset=utf-8," + script.text);
        script.remove();
    }
    else {
        scriptModule = { State: class {
            } };
    }
    let cssModule;
    const style = template.content.querySelector("style");
    if (style) {
        cssModule = { css: style.textContent };
        style.remove();
    }
    else {
        cssModule = {};
    }
    const htmlModule = { html: fromComment(template.innerHTML).trim() };
    return Object.assign({}, scriptModule, htmlModule, cssModule);
}
async function registerSingleFileComponent(customElementName, pathToSingleFileComponent) {
    const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
    registerComponentModule(customElementName, componentModule);
}
async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName) {
    for (const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
        registerSingleFileComponent(customElementName, pathToSingleFileComponent);
    }
}

if (typeof Map.groupBy === 'undefined') {
    Map.groupBy = function (arr, fn) {
        return arr.reduce((acc, item, index) => {
            const key = fn(item, index);
            if (!acc.has(key)) {
                acc.set(key, []);
            }
            acc.get(key).push(item);
            return acc;
        }, new Map());
    };
}

if (typeof Object.groupBy === 'undefined') {
    Object.groupBy = function (array, key) {
        return array.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };
}

if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { 
      promise, 
      resolve, 
      reject
    }
  };

}

if (typeof Array.prototype.toSorted === 'undefined') {
    Array.prototype.toSorted = function (compareFn) {
        return this.slice().sort(compareFn);
    };
}

if (typeof Array.prototype.toReversed === 'undefined') {
    Array.prototype.toReversed = function () {
        return this.slice().reverse();
    };
}

function registerFilters(filters) {
    Object.entries(filters).forEach(([name, filterData]) => {
        const { input, output, event } = filterData;
        input && InputFilterManager.registerFilter(name, input);
        output && OutputFilterManager.registerFilter(name, output);
        event && EventFilterManager.registerFilter(name, event);
    });
}
function registerGlobal(data) {
    Object.assign(GlobalData.data, data);
}

export { bootFromImportMeta, config, generateComponentClass, getCustomTagFromImportMeta, importCssFromImportMeta, importHtmlFromImportMeta, loadSingleFileComponent, loader, registerComponentModules, registerFilters, registerGlobal, registerSingleFileComponents };
