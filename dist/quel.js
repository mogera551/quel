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

const DATASET_BIND_PROPERTY$1 = "data-bind";
const DATASET_UUID_PROPERTY = "data-uuid";
const templateByUUID = {};
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
            const saveExpr = stack[stack.length - 1];
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
        utils.raise(`Template: loop: or if: is not matched with endloop: or endif:, but {{ ${stack[stack.length - 1]} }} `);
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
            removeTopLevelBlankNodes(template.content);
            templateByUUID[uuid] = template;
        }
    };
    replaceTemplate(root.content);
    return root.innerHTML;
}
function removeTopLevelBlankNodes(fragment) {
    const childNodes = Array.from(fragment.childNodes);
    for (let i = 0; i < childNodes.length; i++) {
        const childNode = childNodes[i];
        if (childNode.nodeType !== Node.TEXT_NODE)
            continue;
        if (childNode.textContent?.match(/^\s*$/)) {
            childNode.parentNode?.removeChild(childNode);
        }
    }
}
/**
 * UUIDからHTMLTemplateElementオブジェクトを取得(ループや分岐条件のブロック)
 * @param uuid UUID
 * @returns {HTMLTemplateElement|undefined} HTMLTemplateElementオブジェクト
 */
function getTemplateByUUID(uuid) {
    return templateByUUID[uuid];
}
/**
 * htmlとcssの文字列からコンポーネント用のHTMLTemplateElementオブジェクトを生成
 * @param html HTML文字列
 * @param componentUuid コンポーネントUUID
 */
function createComponentTemplate(html, componentUuid, customComponentNames) {
    const template = document.createElement("template");
    template.innerHTML = replaceTag(html, componentUuid, customComponentNames);
    template.setAttribute(DATASET_UUID_PROPERTY, componentUuid);
    removeTopLevelBlankNodes(template.content);
    templateByUUID[componentUuid] = template;
    return template;
}

const styleSheetByUUID = new Map;
// create style sheet by css text
function _createStyleSheet(cssText) {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(cssText);
    return styleSheet;
}
/**
 * uuidからスタイルシートを取得します。見つからない場合はスタイルシートを作成します。
 * @param cssText スタイルシートのテキスト
 * @param uuid UUID
 * @returns {CSSStyleSheet} スタイルシート
 */
function createStyleSheet$1(cssText, uuid) {
    const styleSheetFromMap = styleSheetByUUID.get(uuid);
    if (styleSheetFromMap)
        return styleSheetFromMap;
    const styleSheet = _createStyleSheet(cssText);
    styleSheetByUUID.set(uuid, styleSheet);
    return styleSheet;
}

class Module {
    #uuid = utils.createUUID();
    get uuid() {
        return this.#uuid;
    }
    #html = "";
    get html() {
        return this.#html;
    }
    set html(value) {
        this.#html = value;
        this.#template = undefined;
    }
    #css;
    get css() {
        return this.#css;
    }
    set css(value) {
        this.#css = value;
        this.#styleSheet = undefined;
    }
    #template;
    get template() {
        if (typeof this.#template === "undefined") {
            const customComponentNames = (this.config.useLocalTagName ?? config.useLocalTagName) ? Object.keys(this.componentModules ?? {}) : [];
            this.#template = createComponentTemplate(this.html, this.uuid, customComponentNames);
        }
        return this.#template;
    }
    #styleSheet;
    get styleSheet() {
        if (typeof this.#styleSheet === "undefined") {
            this.#styleSheet = this.css ? createStyleSheet$1(this.css, this.uuid) : undefined;
        }
        return this.#styleSheet;
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
/**
 * コンポーネントモジュールから中間モジュールを生成します。
 * @param componentModule コンポーネントモジュール
 * @returns {IModule} 中間モジュール
 */
function createModule(componentModule) {
    return Object.assign(new Module, componentModule);
}

const name$3 = "state";
const AccessorPropertiesSymbol = Symbol.for(`${name$3}.accessorProperties`);
const DependenciesSymbol = Symbol.for(`${name$3}.dependencies`);
const ConnectedEventSymbol = Symbol.for(`${name$3}.connectedEvent`);
const DisconnectedEventSymbol = Symbol.for(`${name$3}.disconnectedEvent`);
const UpdatedEventSymbol = Symbol.for(`${name$3}.updatedEvent`);
const ConnectedCallbackSymbol = Symbol.for(`${name$3}.connectedCallback`);
const DisconnectedCallbackSymbol = Symbol.for(`${name$3}.disconnectedCallback`);
const UpdatedCallbackSymbol = Symbol.for(`${name$3}.updatedCallback`);
const DirectryCallApiSymbol = Symbol.for(`${name$3}.directlyCallApi`);
const NotifyForDependentPropsApiSymbol = Symbol.for(`${name$3}.notifyForDependentPropsApi`);
const GetDependentPropsApiSymbol = Symbol.for(`${name$3}.getDependentPropsApi`);
const ClearCacheApiSymbol = Symbol.for(`${name$3}.clearCacheApi`);
const CreateBufferApiSymbol = Symbol.for(`${name$3}.createBufferApi`);
const FlushBufferApiSymbol = Symbol.for(`${name$3}.flushBufferApi`);

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
 * タグがshadow rootを持つことが可能かを判定する
 * @param {string} tagName タグ名
 * @returns {boolean} shadow rootを持つことが可能か
 */
function isAttachableShadowRoot(tagName) {
    return isCustomTag(tagName) || setOfAttachableTags.has(tagName);
}

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
/**
 * title属性名に一致するスタイルシートを取得し複製します
 * @param name title属性名
 * @returns {CSSStyleSheet} スタイルシート
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
/**
 * 名前リストに一致するスタイルシートを取得し複製します
 * @param names 名前リスト
 * @returns {CSSStyleSheet[]} 複製したスタイルシートリスト
 */
function getStyleSheetListByNames(names) {
    // find adopted style sheet from map, if not found, create adopted style sheet
    return names.map(getStyleSheet).filter(excludeEmptySheet);
}

/**
 * スタイルシートのセレクタをローカライズする
 * @param styleSheet スタイルシート
 * @param localSelector ローカルセレクタ
 * @returns {CSSStyleSheet} ローカライズされたスタイルシート
 */
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

async function execProcess(updator, process) {
    if (typeof process.loopContext === "undefined") {
        return await updator.namedLoopIndexesStack.asyncSetNamedLoopIndexes({}, async () => {
            return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
        });
    }
    else {
        return await updator.loopContextStack.setLoopContext(updator.namedLoopIndexesStack, process.loopContext, async () => {
            return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
        });
    }
}
async function _execProcesses(updator, processes) {
    for (let i = 0; i < processes.length; i++) {
        // Stateのイベント処理を実行する
        // Stateのプロパティに更新があった場合、
        // UpdatorのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
        await execProcess(updator, processes[i]);
    }
    return updator.retrieveAllUpdatedStateProperties();
}
function enqueueUpdatedCallback(updator, states, updatedStateProperties) {
    // Stateの$updatedCallbackを呼び出す、updatedCallbackの実行をキューに入れる
    const updateInfos = updatedStateProperties.map(prop => ({ name: prop.pattern, indexes: prop.loopIndexes?.values }));
    updator.addProcess(async () => {
        await states.current[UpdatedCallbackSymbol](updateInfos);
    }, undefined, [], undefined);
}
async function execProcesses(updator, states) {
    const totalUpdatedStateProperties = updator.retrieveAllUpdatedStateProperties();
    await states.asyncSetWritable(async () => {
        do {
            const processes = updator.retrieveAllProcesses();
            if (processes.length === 0)
                break;
            const updateStateProperties = await _execProcesses(updator, processes);
            console.log(updateStateProperties);
            if (updateStateProperties.length > 0) {
                totalUpdatedStateProperties.push(...updateStateProperties);
                enqueueUpdatedCallback(updator, states, updateStateProperties);
            }
        } while (true);
    });
    return totalUpdatedStateProperties;
}

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache$8 = new Map();
/**
 * パターン情報を取得します
 * @param pattern パターン
 * @returns {IPatternInfo} パターン情報
 */
function _getPatternInfo(pattern) {
    const patternElements = pattern.split(".");
    const patternPaths = [];
    const wildcardPaths = [];
    for (let i = 0; i < patternElements.length; i++) {
        let patternPath = "";
        for (let j = 0; j <= i; j++) {
            patternPath += patternElements[j] + (j < i ? "." : "");
        }
        if (patternElements[i] === "*") {
            wildcardPaths.push(patternPath);
        }
        patternPaths.push(patternPath);
    }
    return {
        patternElements,
        patternPaths,
        wildcardPaths,
    };
}
function getPatternInfo(pattern) {
    let info;
    return _cache$8.get(pattern) ?? (info = _getPatternInfo(pattern), _cache$8.set(pattern, info), info);
}

const name$2 = "do-notation";
const GetDirectSymbol = Symbol.for(`${name$2}.getDirect`);
const SetDirectSymbol = Symbol.for(`${name$2}.setDirect`);
const GetByPropInfoSymbol = Symbol.for(`${name$2}.getAccessor`);
const SetByPropInfoSymbol = Symbol.for(`${name$2}.setAccessor`);

class LoopIndexes {
    #parentLoopIndexes;
    #_value;
    #values;
    #stringValue;
    #index;
    get parentLoopIndexes() {
        return this.#parentLoopIndexes;
    }
    get value() {
        return this.#_value;
    }
    get values() {
        if (typeof this.#values === "undefined") {
            if (typeof this.parentLoopIndexes === "undefined") {
                this.#values = [this.#_value];
            }
            else {
                this.#values = this.parentLoopIndexes.values.concat(this.#_value);
            }
        }
        return this.#values;
    }
    get index() {
        if (typeof this.#index === "undefined") {
            if (typeof this.parentLoopIndexes === "undefined") {
                this.#index = 0;
            }
            else {
                this.#index = this.parentLoopIndexes.index + 1;
            }
        }
        return this.#index;
    }
    get size() {
        return this.index + 1;
    }
    truncate(length) {
        let loopIndexes = this;
        while (typeof loopIndexes !== "undefined") {
            if (loopIndexes.index < length)
                return loopIndexes;
            loopIndexes = loopIndexes.parentLoopIndexes;
        }
        return undefined;
    }
    constructor(parentLoopIndexes, value) {
        this.#parentLoopIndexes = parentLoopIndexes;
        this.#_value = value;
    }
    add(value) {
        return new LoopIndexes(this, value);
    }
    *backward() {
        yield this.#_value;
        if (typeof this.#parentLoopIndexes !== "undefined") {
            yield* this.#parentLoopIndexes.backward();
        }
        return;
    }
    *forward() {
        if (typeof this.#parentLoopIndexes !== "undefined") {
            yield* this.#parentLoopIndexes.forward();
        }
        yield this.#_value;
        return;
    }
    toString() {
        if (typeof this.#stringValue === "undefined") {
            if (typeof this.#parentLoopIndexes !== "undefined") {
                this.#stringValue = this.#parentLoopIndexes.toString() + "," + this.#_value;
            }
            else {
                this.#stringValue = this.#_value?.toString() ?? "";
            }
        }
        return this.#stringValue;
    }
    at(index) {
        let iterator;
        if (index >= 0) {
            iterator = this.forward();
        }
        else {
            index = -index - 1;
            iterator = this.backward();
        }
        let next;
        while (index >= 0) {
            next = iterator.next();
            index--;
        }
        return next?.value;
    }
}
function createLoopIndexesFromArray(indexes, index = indexes.length - 1) {
    const value = indexes[index];
    return new LoopIndexes(index > 0 ? createLoopIndexesFromArray(indexes, index - 1) : undefined, value);
}
function createLoopIndexes(parentLoopIndexes, value) {
    return (typeof parentLoopIndexes === "undefined") ? createLoopIndexesFromArray([value]) : parentLoopIndexes.add(value);
}

/**
 * constructorが指定されると、破綻するのでObjectではなくMapを使う
 */
const _cache$7 = new Map();
/**
 * プロパティ情報を取得します
 * @param name プロパティ名
 * @returns {IPropInfo} プロパティ情報
 */
function _getPropInfo(name) {
    let expandable = false;
    if (name[0] === "@") {
        name = name.slice(1);
        expandable = true;
    }
    const wildcardNamedLoopIndexes = new Map;
    const elements = name.split(".");
    const tmpPatternElements = elements.slice();
    let wildcardLoopIndexes = undefined;
    const paths = [];
    let incompleteCount = 0;
    let completeCount = 0;
    let lastPath = "";
    let wildcardCount = 0;
    let wildcardType = "none";
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element === "*") {
            wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, undefined);
            tmpPatternElements[i] = "*";
            incompleteCount++;
            wildcardCount++;
        }
        else {
            const number = Number(element);
            if (!Number.isNaN(number)) {
                wildcardLoopIndexes = createLoopIndexes(wildcardLoopIndexes, number);
                tmpPatternElements[i] = "*";
                completeCount++;
                wildcardCount++;
            }
        }
        lastPath += element;
        paths.push(lastPath);
        lastPath += (i < elements.length - 1 ? "." : "");
    }
    const pattern = tmpPatternElements.join(".");
    const patternInfo = getPatternInfo(pattern);
    let tmpWildcardLoopIndexes = wildcardLoopIndexes;
    for (let i = patternInfo.wildcardPaths.length - 1; i >= 0; i--) {
        if (typeof tmpWildcardLoopIndexes === "undefined")
            throw new Error(`_getPropInfo: tmpWildcardLoopIndexes is undefined.`);
        wildcardNamedLoopIndexes.set(patternInfo.wildcardPaths[i], tmpWildcardLoopIndexes);
        tmpWildcardLoopIndexes = tmpWildcardLoopIndexes?.parentLoopIndexes;
    }
    if (incompleteCount > 0 || completeCount > 0) {
        if (incompleteCount === wildcardCount) {
            wildcardType = "context";
        }
        else if (completeCount === wildcardCount) {
            wildcardType = "all";
        }
        else {
            wildcardType = "partial";
        }
    }
    return {
        name,
        expandable,
        pattern,
        elements,
        paths,
        wildcardCount,
        wildcardLoopIndexes,
        wildcardNamedLoopIndexes,
        patternElements: patternInfo.patternElements,
        patternPaths: patternInfo.patternPaths,
        wildcardPaths: patternInfo.wildcardPaths,
        wildcardType
    };
}
function getPropInfo(name) {
    let info;
    return _cache$7.get(name) ?? (info = _getPropInfo(name), _cache$7.set(name, info), info);
}

class StatePropertyAccessor {
    #pattern;
    #patternInfo;
    #loopIndexes;
    #key;
    get pattern() {
        return this.#pattern;
    }
    get patternInfo() {
        if (typeof this.#patternInfo === "undefined") {
            this.#patternInfo = getPropInfo(this.#pattern);
        }
        return this.#patternInfo;
    }
    get loopIndexes() {
        return this.#loopIndexes;
    }
    get key() {
        if (typeof this.#key === "undefined") {
            this.#key = this.pattern + "\t" + (this.loopIndexes?.toString() ?? "");
        }
        return this.#key;
    }
    constructor(pattern, loopIndexes = undefined) {
        this.#pattern = pattern;
        this.#loopIndexes = loopIndexes;
    }
}
function createStatePropertyAccessor(pattern, loopIndexes) {
    return new StatePropertyAccessor(pattern, loopIndexes);
}

const _pool = [];
function createNamedLoopIndexesFromAccessor(propertyAccessor = undefined) {
    const namedLoopIndexes = _pool.pop() ?? new Map();
    if (typeof propertyAccessor === "undefined")
        return namedLoopIndexes;
    const wildcardPaths = propertyAccessor.patternInfo.wildcardPaths;
    if (wildcardPaths.length === 0 || typeof propertyAccessor.loopIndexes === "undefined")
        return namedLoopIndexes;
    let loopIndexes = propertyAccessor.loopIndexes;
    for (let wi = 0; wi < wildcardPaths.length; wi++) {
        if (typeof loopIndexes === "undefined")
            utils.raise(`createNamedLoopIndexesFromAccessor: loopIndexes is undefined.`);
        const wildcardPath = wildcardPaths.at(-(wi + 1)) ?? utils.raise(`createNamedLoopIndexesFromAccessor: wildcardPath is undefined.`);
        namedLoopIndexes.set(wildcardPath, loopIndexes);
        loopIndexes = loopIndexes.parentLoopIndexes;
    }
    return namedLoopIndexes;
}

function expandStateProperty(state, accessor, updatedStatePropertiesSet, expandedPropertyAccessKeys = new Set([])) {
    const { pattern, loopIndexes } = accessor;
    const propertyAccessKey = pattern + "\t" + (loopIndexes?.toString() ?? "");
    // すでに展開済みの場合は何もしない
    if (expandedPropertyAccessKeys.has(propertyAccessKey))
        return [];
    // 展開済みとしてマーク
    expandedPropertyAccessKeys.add(propertyAccessKey);
    // 依存関係を記述したプロパティ（$dependentProps）を取得
    const dependentProps = state[GetDependentPropsApiSymbol]();
    const props = dependentProps.propsByRefProp[pattern];
    if (typeof props === "undefined")
        return [];
    const propertyAccesses = [];
    const indexesKey = [];
    const curIndexes = [];
    for (let i = 0; i < (loopIndexes?.size ?? 0); i++) {
        curIndexes.push(loopIndexes?.at(i));
        indexesKey.push(curIndexes.toString());
    }
    for (const prop of props) {
        const curPropertyNameInfo = getPatternInfo(prop);
        // 親の配列が更新されている場合は、子の展開は不要
        const updatedParentArray = curPropertyNameInfo.wildcardPaths.some((wildcardPath, index) => {
            const propInfo = getPatternInfo(wildcardPath);
            const parentPath = propInfo.patternPaths.at(-2);
            const key = parentPath + "\t" + (indexesKey[index - 1] ?? "");
            return updatedStatePropertiesSet.has(key);
        });
        if (updatedParentArray) {
            continue;
        }
        if ((loopIndexes?.size ?? 0) < curPropertyNameInfo.wildcardPaths.length) {
            // ワイルドカードのインデックスを展開する
            const listOfIndexes = expandIndexes(state, createStatePropertyAccessor(prop, loopIndexes));
            propertyAccesses.push(...listOfIndexes.map(loopIndexes => createStatePropertyAccessor(prop, loopIndexes)));
        }
        else {
            // ワイルドカードのインデックスを展開する必要がない場合
            const notifyIndexes = loopIndexes?.truncate(curPropertyNameInfo.wildcardPaths.length);
            propertyAccesses.push(createStatePropertyAccessor(prop, notifyIndexes));
        }
        // 再帰的に展開
        propertyAccesses.push(...expandStateProperty(state, createStatePropertyAccessor(prop, loopIndexes), updatedStatePropertiesSet, expandedPropertyAccessKeys));
    }
    return propertyAccesses;
}
function expandIndexes(state, statePropertyAccessor) {
    const { pattern, loopIndexes } = statePropertyAccessor;
    if (typeof loopIndexes === "undefined")
        return [];
    const propInfo = getPropInfo(pattern);
    if (propInfo.wildcardCount === loopIndexes.size) {
        return [loopIndexes];
    }
    else if (propInfo.wildcardCount < loopIndexes.size) {
        return [loopIndexes.truncate(propInfo.wildcardCount)];
    }
    else {
        const getValuesLength = (name, loopIndexes) => {
            const accessor = createStatePropertyAccessor(name, loopIndexes);
            const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
            return state.updator?.namedLoopIndexesStack?.setNamedLoopIndexes(namedLoopIndexes, () => {
                return state[GetByPropInfoSymbol](propInfo).length;
            });
        };
        const traverse = (parentName, elementIndex, _loopIndexes) => {
            const parentNameDot = parentName !== "" ? (parentName + ".") : parentName;
            const element = propInfo.elements[elementIndex];
            const isTerminate = (propInfo.elements.length - 1) === elementIndex;
            if (isTerminate) {
                // 終端の場合
                if (element === "*") {
                    const indexesArray = [];
                    const len = getValuesLength(parentName, _loopIndexes);
                    for (let i = 0; i < len; i++) {
                        indexesArray.push(createLoopIndexes(_loopIndexes, i));
                    }
                    return indexesArray;
                }
                else {
                    return (typeof _loopIndexes !== "undefined") ? [_loopIndexes] : [];
                }
            }
            else {
                // 終端でない場合
                const currentName = parentNameDot + element;
                if (element === "*") {
                    if (loopIndexes.size < (_loopIndexes?.size ?? 0)) {
                        return traverse(currentName, elementIndex + 1, _loopIndexes?.truncate(loopIndexes.size + 1));
                    }
                    else {
                        const indexesArray = [];
                        const len = getValuesLength(parentName, _loopIndexes);
                        for (let i = 0; i < len; i++) {
                            indexesArray.push(...traverse(currentName, elementIndex + 1, createLoopIndexes(_loopIndexes, i)));
                        }
                        return indexesArray;
                    }
                }
                else {
                    return traverse(currentName, elementIndex + 1, loopIndexes);
                }
            }
        };
        return traverse("", 0, undefined);
    }
}
function expandStateProperties(states, updatedStateProperties) {
    // expand state properties
    const expandedStateProperties = updatedStateProperties.slice(0);
    const updatedStatePropertiesSet = new Set(updatedStateProperties.map(prop => prop.pattern + "\t" + (prop.loopIndexes?.toString() ?? "")));
    for (let i = 0; i < updatedStateProperties.length; i++) {
        expandedStateProperties.push.apply(expandedStateProperties, expandStateProperty(states.current, updatedStateProperties[i], updatedStatePropertiesSet));
    }
    return expandedStateProperties;
}

// 
async function rebuildBindings(updator, newBindingSummary, updatedStatePropertyAccessors, updatedKeys) {
    for (let i = 0; i < updatedStatePropertyAccessors.length; i++) {
        const propertyAccessor = updatedStatePropertyAccessors[i];
        const gatheredBindings = newBindingSummary.gatherBindings(propertyAccessor);
        for (let gi = 0; gi < gatheredBindings.length; gi++) {
            const binding = gatheredBindings[gi];
            if (!binding.expandable)
                continue;
            const compareKey = binding.stateProperty.name + ".";
            const isFullBuild = updatedKeys.some(key => key.startsWith(compareKey));
            const namedLoopIndexes = createNamedLoopIndexesFromAccessor(propertyAccessor);
            updator.setFullRebuild(isFullBuild, () => {
                updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
                    binding.rebuild();
                });
            });
        }
    }
}

function setValueToChildNodes(binding, updator, nodeProperty, setOfIndex) {
    updator?.applyNodeUpdatesByBinding(binding, () => {
        nodeProperty.applyToChildNodes(setOfIndex);
    });
}

function updateChildNodes(updator, newBindingSummary, updatedStatePropertyAccesseors) {
    const parentPropertyAccessorByKey = {};
    const indexesByParentKey = {};
    for (const propertyAccessor of updatedStatePropertyAccesseors) {
        const patternElements = propertyAccessor.patternInfo.patternElements;
        if (patternElements[patternElements.length - 1] !== "*")
            continue;
        const lastIndex = propertyAccessor.loopIndexes?.index;
        if (typeof lastIndex === "undefined")
            continue;
        const patternPaths = propertyAccessor.patternInfo.patternPaths;
        const parentLoopIndexes = propertyAccessor.loopIndexes?.parentLoopIndexes;
        const parentPropertyAccessor = createStatePropertyAccessor(patternPaths.at(-2) ?? "", parentLoopIndexes);
        const parentKey = parentPropertyAccessor.key;
        indexesByParentKey[parentKey]?.add(lastIndex) ?? (indexesByParentKey[parentKey] = new Set([lastIndex]));
        parentPropertyAccessorByKey[parentKey] = parentPropertyAccessor;
    }
    for (const [parentKey, indexes] of Object.entries(indexesByParentKey)) {
        const parentPropertyAccessor = parentPropertyAccessorByKey[parentKey];
        newBindingSummary.gatherBindings(parentPropertyAccessor).forEach(binding => {
            const namedLoopIndexes = createNamedLoopIndexesFromAccessor(parentPropertyAccessor);
            updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
                setValueToChildNodes(binding, updator, binding.nodeProperty, indexes);
            });
        });
    }
}

async function updateNodes(updator, newBindingSummary, updatedStatePropertyAccessors) {
    const selectBindings = [];
    for (let i = 0; i < updatedStatePropertyAccessors.length; i++) {
        const propertyAccessor = updatedStatePropertyAccessors[i];
        const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
        const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
        newBindingSummary.gatherBindings(propertyAccessor).forEach(async (binding) => {
            if (binding.expandable)
                return;
            if (binding.nodeProperty.isSelectValue) {
                selectBindings.push({ binding, propertyAccessor });
            }
            else {
                const namedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardPropertyAccessor);
                updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
                    binding.updateNodeForNoRecursive();
                });
            }
        });
    }
    for (let si = 0; si < selectBindings.length; si++) {
        const info = selectBindings[si];
        const propertyAccessor = info.propertyAccessor;
        const lastWildCardPath = propertyAccessor.patternInfo.wildcardPaths.at(-1) ?? "";
        const wildcardPropertyAccessor = createStatePropertyAccessor(lastWildCardPath, propertyAccessor.loopIndexes);
        const namedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardPropertyAccessor);
        updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
            info.binding.updateNodeForNoRecursive();
        });
    }
}

class LoopContextStack {
    stack;
    async setLoopContext(namedLoopIndexesStack, loopContext, callback) {
        if (namedLoopIndexesStack.stack.length > 0) {
            utils.raise("namedLoopIndexesStack is already set.");
        }
        let currentLoopContext = loopContext;
        const namedLoopIndexes = {};
        while (typeof currentLoopContext !== "undefined") {
            const name = currentLoopContext.patternName;
            namedLoopIndexes[name] = currentLoopContext.serialLoopIndexes;
            currentLoopContext = currentLoopContext.parentLoopContext;
        }
        this.stack = loopContext;
        try {
            await namedLoopIndexesStack.asyncSetNamedLoopIndexes(namedLoopIndexes, async () => {
                return await callback();
            });
        }
        finally {
            this.stack = undefined;
        }
    }
}
function createLoopContextStack() {
    return new LoopContextStack();
}

class NamedLoopIndexesStack {
    stack = [];
    get lastNamedLoopIndexes() {
        return this.stack[this.stack.length - 1];
    }
    async asyncSetNamedLoopIndexes(namedLoopIndexes, callback) {
        const tempNamedLoopIndexes = new Map(Object.entries(namedLoopIndexes));
        this.stack.push(tempNamedLoopIndexes);
        try {
            await callback();
        }
        finally {
            this.stack.pop();
        }
    }
    setNamedLoopIndexes(namedLoopIndexes, callback) {
        this.stack.push(namedLoopIndexes);
        try {
            return callback();
        }
        finally {
            this.stack.pop();
        }
    }
    setSubIndex(parentName, name, index, callback) {
        const currentNamedLoopIndexes = this.lastNamedLoopIndexes;
        currentNamedLoopIndexes?.set(name, currentNamedLoopIndexes?.get(parentName ?? "")?.add(index) ?? createLoopIndexes(undefined, index));
        try {
            return callback();
        }
        finally {
            currentNamedLoopIndexes?.delete(name);
        }
    }
    getLoopIndexes(name) {
        const currentNamedLoopIndexes = this.lastNamedLoopIndexes;
        return currentNamedLoopIndexes?.get(name);
    }
}
function createNamedLoopIndexesStack() {
    return new NamedLoopIndexesStack();
}

class Updator {
    #component;
    processQueue = [];
    updatedStateProperties = [];
    expandedStateProperties = [];
    updatedBindings = new Set();
    bindingsForUpdateNode = [];
    loopContextStack = createLoopContextStack();
    namedLoopIndexesStack = createNamedLoopIndexesStack();
    executing = false;
    get states() {
        return this.#component.states;
    }
    get newBindingSummary() {
        return this.#component.newBindingSummary;
    }
    get component() {
        return this.#component;
    }
    constructor(component) {
        this.#component = component;
    }
    addProcess(target, thisArgument, argumentList, loopContext) {
        this.processQueue.push({ target, thisArgument, argumentList, loopContext });
        if (this.executing)
            return;
        this.exec();
    }
    // 取得後processQueueは空になる
    retrieveAllProcesses() {
        const allProcesses = this.processQueue;
        this.processQueue = [];
        return allProcesses;
    }
    addUpdatedStateProperty(accessor) {
        this.updatedStateProperties.push(accessor);
        if (this.executing)
            return;
        this.exec();
    }
    // 取得後updateStatePropertiesは空になる
    retrieveAllUpdatedStateProperties() {
        const updatedStateProperties = this.updatedStateProperties;
        this.updatedStateProperties = [];
        return updatedStateProperties;
    }
    async execCallbackWithPerformance(callback) {
        this.executing = true;
        const uuid = this.#component.template.dataset["uuid"];
        config.debug && performance.mark(`Updator#${uuid}.exec:start`);
        try {
            await callback();
        }
        finally {
            if (config.debug) {
                performance.mark(`Updator#${uuid}.exec:end`);
                performance.measure(`Updator#${uuid}.exec`, `Updator#${uuid}.exec:start`, `Updator#${uuid}.exec:end`);
                console.log(performance.getEntriesByType("measure"));
                performance.clearMeasures(`Updator#${uuid}.exec`);
                performance.clearMarks(`Updator#${uuid}.exec:start`);
                performance.clearMarks(`Updator#${uuid}.exec:end`);
            }
            this.executing = false;
        }
    }
    async exec() {
        await this.execCallbackWithPerformance(async () => {
            while (this.processQueue.length > 0 || this.updatedStateProperties.length > 0) {
                this.updatedBindings.clear();
                // 戻り値は更新されたStateのプロパティ情報
                const _updatedStatePropertyAccessors = await execProcesses(this, this.states);
                const updatedKeys = _updatedStatePropertyAccessors.map(propertyAccessor => propertyAccessor.pattern + "\t" + (propertyAccessor.loopIndexes?.toString() ?? ""));
                // 戻り値は依存関係により更新されたStateのプロパティ情報
                const updatedStatePropertyAccesses = expandStateProperties(this.states, _updatedStatePropertyAccessors);
                await rebuildBindings(this, this.newBindingSummary, updatedStatePropertyAccesses, updatedKeys);
                updateChildNodes(this, this.newBindingSummary, updatedStatePropertyAccesses);
                await updateNodes(this, this.newBindingSummary, updatedStatePropertyAccesses);
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
    #isFullRebuild;
    get isFullRebuild() {
        if (typeof this.#isFullRebuild === "undefined")
            utils.raise("fullRebuild is not set");
        return this.#isFullRebuild;
    }
    setFullRebuild(isFullRebuild, callback) {
        this.#isFullRebuild = isFullRebuild;
        try {
            callback();
        }
        finally {
            this.#isFullRebuild = undefined;
        }
    }
}
function createUpdator(component) {
    return new Updator(component);
}

class PropsBindingInfo {
    parentProp;
    thisProp;
    get key() {
        return `${this.parentProp}:${this.thisProp}`;
    }
    constructor(parentProp, thisProp) {
        this.parentProp = parentProp;
        this.thisProp = thisProp;
    }
}
function createPropsBindingInfo(parentProp, thisProp) {
    return new PropsBindingInfo(parentProp, thisProp);
}

const name$1 = "bindingProps";
const BindPropertySymbol = Symbol.for(`${name$1}.bindPropertySymbol`);
const CheckDuplicateSymbol = Symbol.for(`${name$1}.checkDuplicateSymbol`);
const CreateBufferSymbol = Symbol.for(`${name$1}.createBufferSymbol`);
const GetBufferSymbol = Symbol.for(`${name$1}.getBufferSymbol`);
const FlushBufferSymbol = Symbol.for(`${name$1}.flushBufferSymbol`);
const SetBufferSymbol = Symbol.for(`${name$1}.setBufferSymbol`);
const ClearBufferSymbol = Symbol.for(`${name$1}.clearBufferSymbol`);

const regexp$3 = RegExp(/^\$[0-9]+$/);
const getterFn = (getLoopContext, component, parentPropInfo, thisPropIfo) => {
    return function () {
        const loopContext = getLoopContext();
        const loopIndexes = loopContext?.serialLoopIndexes;
        if (regexp$3.test(parentPropInfo.name)) {
            const index = Number(parentPropInfo.name.slice(1));
            return loopIndexes?.at(index);
        }
        const buffer = component.props[GetBufferSymbol]();
        if (buffer) {
            return buffer[thisPropIfo.name];
        }
        const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
        const parentState = parentComponent.states["current"];
        const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
        const accessor = (typeof lastWildcardPath !== "undefined") ?
            createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
        const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
        return parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
            return parentState[GetByPropInfoSymbol](parentPropInfo);
        });
    };
};

const regexp$2 = RegExp(/^\$[0-9]+$/);
const setterFn = (getLoopContext, component, parentPropInfo, thisPropIfo) => {
    return function (value) {
        if (regexp$2.test(parentPropInfo.name)) {
            utils.raise("Cannot set value to loop index");
        }
        const buffer = component.props[GetBufferSymbol]();
        if (buffer) {
            return buffer[thisPropIfo.name] = value;
        }
        // プロセスキューに積む
        const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
        const loopContext = getLoopContext();
        const writeProperty = (component, propInfo, value) => {
            const state = component.states["current"];
            return state[SetByPropInfoSymbol](propInfo, value);
        };
        parentComponent.updator?.addProcess(writeProperty, undefined, [parentComponent, parentPropInfo, value], loopContext);
        return true;
    };
};

class PropsProxyHandler {
    propsBindingInfos = [];
    propsBindingInfoKeys = new Set();
    parentProps = new Set();
    thisProps = new Set();
    loopContextByParentProp = new Map();
    #component;
    #propBuffer;
    get propBuffer() {
        return this.#propBuffer;
    }
    constructor(component) {
        this.#component = component;
    }
    bindProperty(getLoopContext, parentProp, thisProp) {
        const component = this.#component;
        const bindingInfo = createPropsBindingInfo(parentProp, thisProp);
        if (this.parentProps.has(parentProp)) {
            utils.raise(`Duplicate binding property: ${parentProp}`);
        }
        if (this.thisProps.has(thisProp)) {
            utils.raise(`Duplicate binding property: ${thisProp}`);
        }
        const propInfo = getPropInfo(thisProp);
        if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
            utils.raise(`Invalid prop name: ${thisProp}`);
        }
        if (this.propsBindingInfoKeys.has(bindingInfo.key)) {
            utils.raise(`Duplicate binding property: ${parentProp}:${thisProp}`);
        }
        const parentPropInfo = getPropInfo(parentProp);
        this.propsBindingInfos.push(bindingInfo);
        this.propsBindingInfoKeys.add(bindingInfo.key);
        this.parentProps.add(parentProp);
        this.thisProps.add(thisProp);
        this.loopContextByParentProp.set(parentProp, getLoopContext);
        const state = component.states["base"];
        const attributes = {
            enumerable: true,
            configurable: true,
            get: getterFn(getLoopContext, component, parentPropInfo, propInfo),
            set: setterFn(getLoopContext, component, parentPropInfo, propInfo)
        };
        Object.defineProperty(state, thisProp, attributes);
    }
    setBuffer(buffer) {
        if (this.parentProps.size > 0)
            utils.raise("Binding properties already set");
        this.#propBuffer = buffer;
    }
    getBuffer() {
        return this.#propBuffer;
    }
    clearBuffer() {
        this.#propBuffer = undefined;
    }
    createBuffer() {
        const component = this.#component;
        if (this.parentProps.size === 0)
            utils.raise("No binding properties to buffer");
        this.#propBuffer = {};
        const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
        const parentState = parentComponent.states["current"];
        for (const bindingInfo of this.propsBindingInfos) {
            const { parentProp, thisProp } = bindingInfo;
            const getLoopContext = this.loopContextByParentProp.get(parentProp);
            const loopContext = getLoopContext?.();
            const loopIndexes = loopContext?.serialLoopIndexes;
            const parentPropInfo = getPropInfo(parentProp);
            const lastWildcardPath = parentPropInfo.wildcardPaths.at(-1) ?? "";
            const accessor = (typeof lastWildcardPath !== "undefined") ?
                createStatePropertyAccessor(lastWildcardPath, loopIndexes) : undefined;
            const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
            const parentValue = parentComponent.updator.namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, () => {
                return parentState[GetByPropInfoSymbol](parentPropInfo);
            });
            this.#propBuffer[thisProp] = parentValue;
        }
        return this.#propBuffer;
    }
    flushBuffer() {
        const component = this.#component;
        if (this.#propBuffer === undefined)
            return;
        const parentComponent = component.parentComponent ?? utils.raise("parentComponent is undefined");
        for (const bindingInfo of this.propsBindingInfos) {
            const { parentProp, thisProp } = bindingInfo;
            const getLoopContext = this.loopContextByParentProp.get(parentProp);
            const loopContext = getLoopContext?.();
            const parentPropInfo = getPropInfo(parentProp);
            const value = this.#propBuffer[thisProp];
            // プロセスキューに積む
            const writeProperty = (component, propInfo, value) => {
                const state = component.states["current"];
                return state[SetByPropInfoSymbol](propInfo, value);
            };
            parentComponent.updator?.addProcess(writeProperty, undefined, [parentComponent, parentPropInfo, value], loopContext);
        }
    }
    get(target, prop, receiver) {
        if (prop === BindPropertySymbol) {
            return (parentProp, thisProp, getLoopContext) => this.bindProperty(getLoopContext, parentProp, thisProp);
        }
        else if (prop === SetBufferSymbol) {
            return (buffer) => this.setBuffer(buffer);
        }
        else if (prop === GetBufferSymbol) {
            return () => this.getBuffer();
        }
        else if (prop === ClearBufferSymbol) {
            return () => this.clearBuffer();
        }
        else if (prop === CreateBufferSymbol) {
            return () => this.createBuffer();
        }
        else if (prop === FlushBufferSymbol) {
            return () => this.flushBuffer();
        }
        else if (prop === CheckDuplicateSymbol) {
            return (parentProp, thisProp) => {
                const bindingInfo = createPropsBindingInfo(parentProp, thisProp);
                return this.propsBindingInfoKeys.has(bindingInfo.key);
            };
        }
        if (typeof prop === "symbol" || typeof prop === "number") {
            return Reflect.get(target, prop, receiver);
        }
        const propInfo = getPropInfo(prop);
        if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
            utils.raise(`Invalid prop name: ${prop}`);
        }
        const component = this.#component;
        const state = component.states["current"];
        return component.updator.namedLoopIndexesStack.setNamedLoopIndexes(propInfo.wildcardNamedLoopIndexes, () => state[GetByPropInfoSymbol](propInfo));
    }
    set(target, prop, value, receiver) {
        if (typeof prop === "symbol" || typeof prop === "number") {
            return Reflect.set(target, prop, value, receiver);
        }
        const propInfo = getPropInfo(prop);
        if (propInfo.wildcardType === "context" || propInfo.wildcardType === "partial") {
            utils.raise(`Invalid prop name: ${prop}`);
        }
        // プロセスキューに積む
        const component = this.#component;
        const writeProperty = (component, propInfo, value) => {
            const state = component.states["current"];
            return component.updator.namedLoopIndexesStack.setNamedLoopIndexes(propInfo.wildcardNamedLoopIndexes, () => state[SetByPropInfoSymbol](propInfo, value));
        };
        component.updator?.addProcess(writeProperty, undefined, [component, propInfo, value], undefined);
        return true;
    }
    ownKeys(target) {
        return Array.from(this.thisProps);
    }
    getOwnPropertyDescriptor(target, prop) {
        if (!this.thisProps.has(prop))
            return {
                enumerable: false,
                configurable: true
            };
        return {
            enumerable: true,
            configurable: true
            /* ...other flags, probable "value:..."" */
        };
    }
}
function createProps(component) {
    return new Proxy({}, new PropsProxyHandler(component));
}

const BoundByComponentSymbol = Symbol.for(`globalData.boundByComponent`);

/**
 * ドット記法のプロパティから値を取得する関数を生成します
 * @param handler Proxyハンドラ
 * @returns {GetValueFn} ドット記法のプロパティから値を取得する関数
 */
const getValueFn = (handler) => {
    return function _getValue(target, patternPaths, patternElements, wildcardPaths, namedLoopIndexes, pathIndex, wildcardIndex, receiver, cache = handler.cache, findPropertyCallback = handler.findPropertyCallback, cachable = typeof handler.cache !== "undefined", callable = patternPaths.length > 1 && typeof handler.findPropertyCallback === "function", cacheKeys = undefined) {
        let value, element, isWildcard, path = patternPaths[pathIndex], cacheKey;
        if (callable) {
            // @ts-ignore
            findPropertyCallback(path);
        }
        const wildcardLoopIndexes = namedLoopIndexes.get(wildcardPaths[wildcardIndex]);
        // @ts-ignore
        return cachable ?
            ( /* use cache */
            // @ts-ignore
            value = cache[cacheKey = path + ":" + (wildcardLoopIndexes?.toString() ?? "")] ?? (
            /* cache value is null or undefined */
            // @ts-ignore
            (cacheKey in cache) ? value : (
            /* no cahce */
            // @ts-ignore
            cache[cacheKey] = ((value = Reflect.get(target, path, receiver)) ?? ((path in target || pathIndex === 0) ? value : (element = patternElements[pathIndex],
                isWildcard = element === "*",
                _getValue(target, patternPaths, patternElements, wildcardPaths, namedLoopIndexes, pathIndex - 1, wildcardIndex - (isWildcard ? 1 : 0), receiver, cache, findPropertyCallback, cachable, callable, cacheKeys)[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element])))))) : (
        /* not use cache */
        (value = Reflect.get(target, path, receiver)) ?? ((path in target || pathIndex === 0) ? value : (element = patternElements[pathIndex],
            isWildcard = element === "*",
            _getValue(target, patternPaths, patternElements, wildcardPaths, namedLoopIndexes, pathIndex - 1, wildcardIndex - (isWildcard ? 1 : 0), receiver, cache, findPropertyCallback, cachable, callable, cacheKeys)[isWildcard ? (wildcardLoopIndexes?.value ?? utils.raise(`wildcard is undefined`)) : element])));
    };
};

/**
 * ドット記法の"@"プロパティから値を展開する関数を生成します
 * ex) "@aaa.*.bbb.*.ccc" => 値の配列
 * @param handler Proxyハンドラ
 * @returns {GetExpandValuesFn} ドット記法の"@"プロパティから値を展開する関数
 */
const getExpandValuesFn = (handler) => {
    const getValue = getValueFn(handler);
    return function (target, propInfo, receiver) {
        // ex.
        // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0] }
        // prop = "aaa.*.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
        // prop = "aaa.1.bbb.*.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
        // prop = "aaa.*.bbb.1.ccc", stack = { "aaa.*": [0], "aaa.*.bbb.*": [0,1] }
        // prop = "aaa.0.bbb.1.ccc", NG 
        if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
            utils.raise(`wildcard type is invalid`);
        }
        const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getExpandValuesFn: namedLoopIndexesStack is undefined");
        const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getExpandValuesFn: namedLoopIndexes is undefined");
        let indexes;
        let lastIndex = undefined;
        if (propInfo.wildcardType === "context") {
            // 一番後ろの*を展開する
            lastIndex = (propInfo.wildcardLoopIndexes?.size ?? 0) - 1;
            indexes = namedLoopIndexes.get(propInfo.pattern)?.values ?? utils.raise(`namedLoopIndexes is undefined`);
            indexes[indexes.length - 1] = undefined;
        }
        else {
            // partialの場合、後ろから*を探す
            let loopIndexes = [];
            const values = propInfo.wildcardLoopIndexes?.values ?? [];
            for (let i = values.length - 1; i >= 0; i--) {
                if (typeof lastIndex === "undefined" && typeof values[i] === "undefined") {
                    lastIndex = i;
                }
                if (typeof loopIndexes === "undefined" && namedLoopIndexes.has(propInfo.wildcardPaths[i])) {
                    loopIndexes = namedLoopIndexes.get(propInfo.wildcardPaths[i])?.values ?? utils.raise(`loopIndexes is undefined`);
                }
                if (typeof lastIndex !== "undefined" && typeof loopIndexes !== "undefined") {
                    break;
                }
            }
            indexes = [];
            const wildcardIndexes = propInfo.wildcardLoopIndexes?.values ?? utils.raise(`wildcardIndexes is undefined`);
            for (let i = 0; i < propInfo.wildcardCount; i++) {
                if (i === lastIndex) {
                    indexes.push(undefined);
                }
                else {
                    indexes.push(wildcardIndexes[i] ?? loopIndexes[i]);
                }
            }
        }
        if (typeof lastIndex === "undefined") {
            utils.raise(`lastIndex is undefined`);
        }
        const expandWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
        const expandWildcardPathInfo = getPropInfo(expandWildcardPath);
        const expandWildcardParentPath = expandWildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
        const expandWildcardParentPathInfo = getPropInfo(expandWildcardParentPath);
        const wildcardLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, lastIndex));
        const wildcardAccessor = createStatePropertyAccessor(expandWildcardParentPathInfo.pattern, wildcardLoopIndexes);
        const wildcardNamedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardAccessor);
        const length = getValue(target, expandWildcardParentPathInfo.patternPaths, expandWildcardParentPathInfo.patternElements, expandWildcardParentPathInfo.wildcardPaths, wildcardNamedLoopIndexes, expandWildcardParentPathInfo.paths.length - 1, expandWildcardParentPathInfo.wildcardCount - 1, receiver).length;
        const values = [];
        for (let i = 0; i < length; i++) {
            indexes[lastIndex] = i;
            const LoopIndexes = createLoopIndexesFromArray(indexes);
            const accessor = createStatePropertyAccessor(propInfo.pattern, LoopIndexes);
            const namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
            const value = getValue(target, propInfo.patternPaths, propInfo.patternElements, propInfo.wildcardPaths, namedLoopIndexes, propInfo.paths.length - 1, propInfo.wildcardCount - 1, receiver);
            values.push(value);
        }
        return values;
    };
};

/**
 * ドット記法の"@"プロパティに値をセットする関数を生成します
 * ex) "@aaa.*.bbb.*.ccc" => 値の配列
 * @param handler Proxyハンドラ
 * @returns {SetExpandValuesFn} ドット記法の"@"プロパティに値をセットする関数
 */
const setExpandValuesFn = (handler) => {
    const getValue = getValueFn(handler);
    return function (target, propInfo, value, receiver) {
        if (propInfo.wildcardType === "none" || propInfo.wildcardType === "all") {
            utils.raise(`wildcard type is invalid`);
        }
        const notifyCallback = handler.notifyCallback;
        const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getExpandValuesFn: namedLoopIndexesStack is undefined");
        const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getExpandValuesFn: namedLoopIndexes is undefined");
        let indexes;
        let lastIndex = undefined;
        if (propInfo.wildcardType === "context") {
            // 一番後ろの*を展開する
            lastIndex = (propInfo.wildcardLoopIndexes?.size ?? 0) - 1;
            indexes = namedLoopIndexes.get(propInfo.pattern)?.values ?? utils.raise(`namedLoopIndexes is undefined`);
            indexes[indexes.length - 1] = undefined;
        }
        else {
            // partialの場合、後ろから*を探す
            let loopIndexes = [];
            const values = propInfo.wildcardLoopIndexes?.values ?? [];
            for (let i = values.length - 1; i >= 0; i--) {
                if (typeof lastIndex === "undefined" && typeof values[i] === "undefined") {
                    lastIndex = i;
                }
                if (typeof loopIndexes === "undefined" && namedLoopIndexes.has(propInfo.wildcardPaths[i])) {
                    loopIndexes = namedLoopIndexes.get(propInfo.wildcardPaths[i])?.values ?? utils.raise(`loopIndexes is undefined`);
                }
                if (typeof lastIndex !== "undefined" && typeof loopIndexes !== "undefined") {
                    break;
                }
            }
            indexes = [];
            const wildcardIndexes = propInfo.wildcardLoopIndexes?.values ?? utils.raise(`wildcardIndexes is undefined`);
            for (let i = 0; i < propInfo.wildcardCount; i++) {
                if (i === lastIndex) {
                    indexes.push(undefined);
                }
                else {
                    indexes.push(wildcardIndexes[i] ?? loopIndexes[i]);
                }
            }
        }
        if (typeof lastIndex === "undefined") {
            utils.raise(`lastIndex is undefined`);
        }
        const expandWildcardPath = propInfo.wildcardPaths[lastIndex] ?? utils.raise(`wildcard path is undefined`);
        const expandWildcardPathInfo = getPropInfo(expandWildcardPath);
        const expandWildcardParentPath = expandWildcardPathInfo.paths.at(-2) ?? utils.raise(`wildcard parent path is undefined`);
        const expandWildcardParentPathInfo = getPropInfo(expandWildcardParentPath);
        const wildcardLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, lastIndex));
        const wildcardAccessor = createStatePropertyAccessor(expandWildcardParentPathInfo.pattern, wildcardLoopIndexes);
        const wildcardNamedLoopIndexes = createNamedLoopIndexesFromAccessor(wildcardAccessor);
        const length = getValue(target, expandWildcardParentPathInfo.patternPaths, expandWildcardParentPathInfo.patternElements, expandWildcardParentPathInfo.wildcardPaths, wildcardNamedLoopIndexes, expandWildcardParentPathInfo.paths.length - 1, expandWildcardParentPathInfo.wildcardCount - 1, receiver).length;
        for (let i = 0; i < length; i++) {
            indexes[lastIndex] = i;
            const parentPropInfo = getPropInfo(propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined"));
            const parentLoopIndexes = createLoopIndexesFromArray(indexes.slice(0, parentPropInfo.wildcardCount - 1));
            const parentAccessor = createStatePropertyAccessor(parentPropInfo.pattern, parentLoopIndexes);
            const parentNamedLoopIndexes = createNamedLoopIndexesFromAccessor(parentAccessor);
            const parentValue = getValue(target, parentPropInfo.patternPaths, parentPropInfo.patternElements, parentPropInfo.wildcardPaths, parentNamedLoopIndexes, parentPropInfo.paths.length - 1, parentPropInfo.wildcardCount - 1, receiver);
            const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
            const isWildcard = lastElement === "*";
            Reflect.set(parentValue, isWildcard ? (namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")) : lastElement, Array.isArray(value) ? value[i] : value);
            if (notifyCallback) {
                notifyCallback(propInfo.pattern, namedLoopIndexes.get(propInfo.pattern));
            }
        }
    };
};

function createOverrideLoopIndexes(baseIndexes, overrideIndexes) {
    let loopIndexes = undefined;
    const iteratorBase = baseIndexes.forward();
    const iteratorOverride = overrideIndexes.forward();
    while (true) {
        const baseIndex = iteratorBase.next();
        const overrideIndex = iteratorOverride.next();
        if (baseIndex.done || overrideIndex.done)
            break;
        loopIndexes = createLoopIndexes(loopIndexes, overrideIndex.value ?? baseIndex.value);
    }
    return loopIndexes ?? utils.raise(`createOverrideLoopIndexes: loopIndexes is undefined.`);
}

function getValueByPropInfoFn(handler) {
    const getValue = getValueFn(handler);
    return function (target, propInfo, receiver) {
        let namedLoopIndexes;
        propInfo.expandable;
        const _getValue = () => getValue(target, propInfo.patternPaths, propInfo.patternElements, propInfo.wildcardPaths, namedLoopIndexes, propInfo.paths.length - 1, propInfo.wildcardCount - 1, receiver);
        const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
        if (propInfo.wildcardType === "context" || propInfo.wildcardType === "none") {
            namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            return _getValue();
        }
        else if (propInfo.wildcardType === "all") {
            namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
            return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
        }
        else {
            const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
            const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
            namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
            return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _getValue);
        }
    };
}

function setValueByPropInfoFn(handler) {
    const getValue = getValueFn(handler);
    return function (target, propInfo, value, receiver) {
        const notifyCallback = handler.notifyCallback;
        let namedLoopIndexes;
        const _setValue = () => {
            try {
                if (propInfo.elements.length === 1) {
                    return Reflect.set(target, propInfo.name, value, receiver);
                }
                if (propInfo.pattern in target) {
                    return Reflect.set(target, propInfo.pattern, value, receiver);
                }
                const parentPath = propInfo.patternPaths.at(-2) ?? utils.raise("setValueFromPropInfoFn: parentPropInfo is undefined");
                const parentPropInfo = getPropInfo(parentPath);
                const parentValue = getValue(target, parentPropInfo.patternPaths, parentPropInfo.patternElements, parentPropInfo.wildcardPaths, namedLoopIndexes, parentPropInfo.paths.length - 1, parentPropInfo.wildcardCount - 1, receiver);
                const lastElement = propInfo.elements.at(-1) ?? utils.raise("setValueFromPropInfoFn: lastElement is undefined");
                const isWildcard = lastElement === "*";
                return Reflect.set(parentValue, isWildcard ? (namedLoopIndexes.get(propInfo.pattern)?.value ?? utils.raise("setValueFromPropInfoFn: wildcard index is undefined")) : lastElement, value);
            }
            finally {
                if (notifyCallback) {
                    notifyCallback(propInfo.pattern, namedLoopIndexes.get(propInfo.wildcardPaths.at(-1) ?? ""));
                }
            }
        };
        const namedLoopIndexesStack = handler.getNamedLoopIndexesStack?.() ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexesStack is undefined");
        if (propInfo.wildcardType === "context" || propInfo.wildcardType === "none") {
            namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            return _setValue();
        }
        else if (propInfo.wildcardType === "all") {
            namedLoopIndexes = propInfo.wildcardNamedLoopIndexes;
            return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
        }
        else {
            const baseLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes?.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            const overrideLoopIndexes = propInfo.wildcardNamedLoopIndexes.get(propInfo.pattern) ?? utils.raise("getValueFromPropInfoFn: namedLoopIndexes is undefined");
            const loopIndexes = createOverrideLoopIndexes(baseLoopIndexes, overrideLoopIndexes);
            const accessor = createStatePropertyAccessor(propInfo.pattern, loopIndexes);
            namedLoopIndexes = createNamedLoopIndexesFromAccessor(accessor);
            return namedLoopIndexesStack.setNamedLoopIndexes(namedLoopIndexes, _setValue);
        }
    };
}

/**
 * ドット記法でプロパティを取得するためのハンドラ
 */
let Handler$1 = class Handler {
    cache = undefined;
    getValue = getValueFn(this);
    getExpandValues = getExpandValuesFn(this);
    setExpandValues = setExpandValuesFn(this);
    getValueByPropInfo = getValueByPropInfoFn(this);
    setValueByPropInfo = setValueByPropInfoFn(this);
    getNamedLoopIndexesStack;
    clearCache() {
        if (typeof this.cache !== "undefined") {
            this.cache = {};
        }
    }
    findPropertyCallback;
    notifyCallback;
    get(target, prop, receiver) {
        const isPropString = typeof prop === "string";
        do {
            if (isPropString && (prop.startsWith("@@__") || prop === "constructor"))
                break;
            if (prop === GetByPropInfoSymbol) {
                return (propInfo) => this.getValueByPropInfo(target, propInfo, receiver);
            }
            if (prop === SetByPropInfoSymbol) {
                return (propInfo, value) => this.setValueByPropInfo(target, propInfo, value, receiver);
            }
            if (!isPropString)
                break;
            if (prop[0] === "$") {
                const index = Number(prop.slice(1));
                if (isNaN(index))
                    break;
                const namedLoopIndexesStack = this.getNamedLoopIndexesStack?.() ?? utils.raise("get: namedLoopIndexesStack is undefined");
                const namedLoopIndexes = namedLoopIndexesStack.lastNamedLoopIndexes ?? utils.raise("get: namedLoopIndexes is undefined");
                const tmpNamedLoopIndexes = Array.from(namedLoopIndexes.values()).filter(v => v.size === index);
                if (tmpNamedLoopIndexes.length !== 1) {
                    utils.raise(`context index(${prop}) is ambiguous or null`);
                }
                return tmpNamedLoopIndexes[0].value;
            }
            const propInfo = getPropInfo(prop);
            return this.getValueByPropInfo(target, propInfo, receiver);
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
            if (prop[0] === "$") {
                const index = Number(prop.slice(1));
                if (isNaN(index))
                    break;
                utils.raise(`context index(${prop}) is read only`);
            }
            const propInfo = getPropInfo(prop);
            return this.setValueByPropInfo(target, propInfo, value, receiver);
        } while (false);
        return Reflect.set(target, prop, value, receiver);
    }
};

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
        /**
         * ToDo:GlobalDataを変更する
         */
        return true;
        /*
            const { pattern, wildcardLoopIndexes, wildcardNamedLoopIndexes } = getPropInfo(prop);
            const namedLoopIndexes = wildcardNamedLoopIndexes;
            const result = receiver[SetAccessorSymbol](createStatePropertyAccessor(pattern, wildcardLoopIndexes), value);
            let setOfComponent = this.#setOfComponentByProp.get(pattern);
            if (setOfComponent) {
              for(const component of setOfComponent) {
                component.states.current[NotifyForDependentPropsApiSymbol]("$globals." + pattern, wildcardLoopIndexes);
              }
            }
            return result;
        */
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
    directGet = (name, loopIndexes) => {
        if (!this.setOfProps.has(name)) {
            this.bindProperty(name);
        }
        return GlobalData.data[GetDirectSymbol](name, loopIndexes);
    };
    directSet = (name, loopIndexes, value) => {
        if (!this.setOfProps.has(name)) {
            this.bindProperty(name);
        }
        return GlobalData.data[SetDirectSymbol](name, loopIndexes, value);
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
        const { pattern, wildcardLoopIndexes } = getPropInfo(prop);
        return this.directGet(pattern, wildcardLoopIndexes);
    }
    set(target, prop, value, receiver) {
        if (typeof prop !== "string")
            return Reflect.set(target, prop, value, receiver);
        const { pattern, wildcardLoopIndexes } = getPropInfo(prop);
        return this.directSet(pattern, wildcardLoopIndexes, value);
    }
}
/**
 *
 * @param component グローバルデータへのアクセスを作成するコンポーネント
 * @returns {IGlobalDataProxy} グローバルデータへのアクセス
 */
function createGlobals(component) {
    return new Proxy({}, new ComponentGlobalDataHandler(component));
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
 * コメントノードをテキストノードに置き換える
 * @param node ノード
 * @param nodeType ノードタイプ
 * @returns {Node} ノード
 */
function replaceTextNodeFromComment(node, nodeType) {
    return replaceTextNodeFn[nodeType](node);
}

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
 * ノードからdata-bind属性を削除
 * @param node ノード
 * @param nodeType ノードタイプ
 * @returns {Node} ノード
 */
function removeDataBindAttribute(node, nodeType) {
    return removeAttributeByNodeType[nodeType](node);
}

const excludeTypes = new Set([
    "button",
    "image",
    "hidden",
    "reset",
    "submit",
    "unknown",
]);
/**
 * ユーザー操作によりデフォルト値を変更するかどうか
 * DOMノードが入力を受け付けるかどうか
 */
const isInputableHTMLElement = (node) => node instanceof HTMLElement &&
    (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement ||
        (node instanceof HTMLInputElement && !excludeTypes.has(node.type)));
const alwaysFalse = (node) => false;
const isInputableFn = {
    HTMLElement: isInputableHTMLElement,
    SVGElement: alwaysFalse,
    Text: alwaysFalse,
    Template: alwaysFalse,
};
/**
 * ノードが入力を受け付けるかどうか
 * @param node ノード
 * @param nodeType ノードタイプ
 * @returns {boolean} ノードが入力を受け付けるかどうか
 */
function canNodeAcceptInput(node, nodeType) {
    return isInputableFn[nodeType](node);
}

const SAMENAME = "@";
const DEFAULT = "$";
const trim$1 = (s) => s.trim();
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
    const [name, ...options] = text.split(",").map(trim$1);
    return { name, options: options.map(decode) };
};
/**
 * parse expression
 * "value|eq,100|falsey" ---> ["value", Filter[]]
 */
const parseProperty = (text) => {
    const [property, ...filterTexts] = text.split("|").map(trim$1);
    return { property, filters: filterTexts.map(parseFilter) };
};
/**
 * parse expressions
 * "textContent:value|eq,100|falsey" ---> ["textContent", "value", Filter[eq, falsey]]
 */
const parseExpression = (expr, defaultName) => {
    const [nodePropertyText, statePropertyText] = [defaultName].concat(...expr.split(":").map(trim$1)).splice(-2);
    const { property: nodeProperty, filters: inputFilters } = parseProperty(nodePropertyText);
    const { property: stateProperty, filters: outputFilters } = parseProperty(statePropertyText);
    return { nodeProperty, stateProperty, inputFilters, outputFilters };
};
/**
 * parse bind text and return BindText[]
 */
const parseExpressions = (text, defaultName) => {
    return text.split(";").map(trim$1).filter(has).map(s => {
        let { nodeProperty, stateProperty, inputFilters, outputFilters } = parseExpression(s, DEFAULT);
        stateProperty = stateProperty === SAMENAME ? nodeProperty : stateProperty;
        nodeProperty = nodeProperty === DEFAULT ? defaultName : nodeProperty;
        return { nodeProperty, stateProperty, inputFilters, outputFilters };
    });
};
const _cache$6 = {};
/**
 * 取得したバインドテキスト(getBindTextByNodeType)を解析して、バインド情報を取得する
 * @param text バインドテキスト
 * @param defaultName デフォルト名
 * @returns {ParsedBindText[]} バインド情報
 */
function parseBindText(text, defaultName) {
    if (text.trim() === "")
        return [];
    const key = text + "\t" + defaultName;
    return _cache$6[key] ?? (_cache$6[key] = parseExpressions(text, defaultName));
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
const _cache$5 = {};
const undefinedProperty = (node) => undefined;
const textContentProperty = (node) => DEFAULT_PROPERTY;
const getDefaultPropertyByNodeType = {
    HTMLElement: getDefaultPropertyHTMLElement,
    SVGElement: undefinedProperty,
    Text: textContentProperty,
    Template: undefinedProperty,
};
/**
 * バインド情報でノードプロパティを省略された場合のデフォルトのプロパティ名を取得
 * @param node ノード
 * @param nodeType ノードタイプ
 * @returns {string | undefined} デフォルトのプロパティ名
 */
function getDefaultPropertyForNode(node, nodeType) {
    const key = node.constructor.name + "\t" + (node.type ?? ""); // type attribute
    return _cache$5[key] ?? (_cache$5[key] = getDefaultPropertyByNodeType[nodeType](node));
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
    getValue() {
        // @ts-ignore
        return this.node[this.name];
        //    return Reflect.get(this.node, this.name);
    }
    setValue(value) {
        // @ts-ignore
        this.node[this.name] = value;
        //    Reflect.set(this.node, this.name, value);
    }
    #filterTexts;
    #filters;
    get filters() {
        if (typeof this.#filters === "undefined") {
            this.#filters = Filters.create(this.#filterTexts, this.binding.inputFilterManager);
        }
        return this.#filters;
    }
    /** @type {any} */
    getFilteredValue() {
        const value = this.getValue();
        return this.filters.length === 0 ? value : FilterManager.applyFilter(value, this.filters);
    }
    // setValueToNode()の対象かどうか
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
    get revisionForLoop() {
        return utils.raise("not loopable");
    }
    get loopable() {
        return false;
    }
    constructor(binding, node, name, filterTexts) {
        if (!(node instanceof Node))
            utils.raise("NodeProperty: not Node");
        this.#binding = binding;
        this.#node = node;
        this.#name = name;
        this.#nameElements = name.split(".");
        this.#filterTexts = filterTexts;
    }
    initialize() {
    }
    postUpdate(propertyAccessByStatePropertyKey) {
    }
    equals(value) {
        return this.getValue() === value;
    }
    applyToChildNodes(setOfIndex) {
    }
    dispose() {
    }
    revisionUpForLoop() {
        return 0;
    }
}

const PREFIX$3 = "@@|";
function getUUIDFromNode(node) {
    return node.textContent?.slice(PREFIX$3.length) ?? utils.raise("TemplateProperty: invalid node");
}
class TemplateProperty extends NodeProperty {
    #template;
    get template() {
        if (typeof this.#template === "undefined") {
            this.#template = getTemplateByUUID(this.uuid) ?? utils.raise(`TemplateProperty: invalid uuid ${this.uuid}`);
        }
        return this.#template;
    }
    #uuid;
    get uuid() {
        if (typeof this.#uuid === "undefined") {
            this.#uuid = getUUIDFromNode(this.node);
        }
        return this.#uuid;
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

class Loop extends TemplateProperty {
    #revisionForLoop = 0;
    get revisionForLoop() {
        return this.#revisionForLoop;
    }
    get loopable() {
        return true;
    }
    dispose() {
        super.dispose();
        this.#revisionForLoop++;
    }
    revisionUpForLoop() {
        return ++this.#revisionForLoop;
    }
}

const rebuildFunc = (contentBindings) => contentBindings.rebuild();
class Repeat extends Loop {
    getValue() {
        return this.binding.childrenContentBindings;
    }
    setValue(value) {
        if (!Array.isArray(value))
            utils.raise(`Repeat: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
        const uuid = this.uuid;
        const binding = this.binding;
        const lastValueLength = this.getValue().length;
        const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
        const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
        const stateName = this.binding.stateProperty.name;
        this.revisionUpForLoop();
        if (lastValueLength < value.length) {
            this.binding.childrenContentBindings.forEach(rebuildFunc);
            for (let newIndex = lastValueLength; newIndex < value.length; newIndex++) {
                const contentBindings = createContentBindings(uuid, binding);
                this.binding.appendChildContentBindings(contentBindings);
                this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, stateName, newIndex, () => {
                    contentBindings.rebuild();
                });
            }
        }
        else if (lastValueLength > value.length) {
            const removeContentBindings = this.binding.childrenContentBindings.splice(value.length);
            this.binding.childrenContentBindings.forEach(rebuildFunc);
            removeContentBindings.forEach(contentBindings => contentBindings.dispose());
        }
        else {
            this.binding.childrenContentBindings.forEach(rebuildFunc);
        }
    }
    constructor(binding, node, name, filters) {
        if (name !== "loop")
            utils.raise(`Repeat: invalid property name '${name}'`);
        super(binding, node, name, filters);
    }
    equals(value) {
        return false;
    }
}

class Branch extends TemplateProperty {
    getValue() {
        return this.binding.childrenContentBindings.length > 0;
    }
    /**
     * Set value to bind/unbind child bindingManager
     */
    setValue(value) {
        if (typeof value !== "boolean")
            utils.raise(`Branch: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not boolean`);
        const lastValue = this.getValue();
        const uuid = this.uuid;
        const binding = this.binding;
        if (lastValue !== value) {
            if (value) {
                const contentBindings = createContentBindings(uuid, binding);
                this.binding.appendChildContentBindings(contentBindings);
                contentBindings.rebuild();
            }
            else {
                this.binding.removeAllChildrenContentBindings();
            }
        }
        else {
            this.binding.childrenContentBindings.forEach(contentBindings => contentBindings.rebuild());
        }
    }
    constructor(binding, node, name, filters) {
        if (name !== "if")
            utils.raise(`Branch: invalid property name ${name}`);
        super(binding, node, name, filters);
    }
    equals(value) {
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
    getValue() {
        return this.element.className.length > 0 ? this.element.className.split(" ") : [];
    }
    setValue(value) {
        if (!Array.isArray(value))
            utils.raise(`ElementClassName: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
        this.element.className = value.join(" ");
    }
    constructor(binding, node, name, filters) {
        if (name !== NAME)
            utils.raise(`ElementClassName: invalid property name ${name}`);
        super(binding, node, name, filters);
    }
}

class MultiValue {
    value;
    enabled = false;
    constructor(value, enabled) {
        this.value = value;
        this.enabled = enabled;
    }
}

class Checkbox extends ElementBase {
    get inputElement() {
        return this.node;
    }
    _value = new MultiValue(undefined, false);
    getValue() {
        this._value.value = this.inputElement.value;
        this._value.enabled = this.inputElement.checked;
        return this._value;
    }
    setValue(value) {
        if (!Array.isArray(value))
            utils.raise(`Checkbox: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
        const multiValue = this.getFilteredValue();
        this.inputElement.checked = value.some(v => v === multiValue.value);
    }
    _filteredValue = new MultiValue(undefined, false);
    getFilteredValue() {
        const multiValue = this.getValue();
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
    equals(value) {
        return false;
    }
}

class Radio extends ElementBase {
    get inputElement() {
        return this.element;
    }
    _value = new MultiValue(undefined, false);
    getValue() {
        this._value.value = this.inputElement.value;
        this._value.enabled = this.inputElement.checked;
        return this._value;
    }
    setValue(value) {
        const multiValue = this.filteredValue;
        this.inputElement.checked = (value === multiValue.value) ? true : false;
    }
    _filteredValue = new MultiValue(undefined, false);
    get filteredValue() {
        const multiValue = this.getValue();
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
    equals(value) {
        return false;
    }
}

const PREFIX$2 = "on";
class ElementEvent extends ElementBase {
    // nameのonの後ろを取得する
    get eventType() {
        return this.name.slice(PREFIX$2.length); // on～
    }
    // setValueToNode()の対象かどうか
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
    #filterTexts;
    #eventFilters;
    get eventFilters() {
        if (typeof this.#eventFilters === "undefined") {
            this.#eventFilters = Filters.create(this.#filterTexts, this.binding.eventFilterManager);
        }
        return this.#eventFilters;
    }
    constructor(binding, node, name, filterTexts) {
        if (!name.startsWith(PREFIX$2))
            utils.raise(`ElementEvent: invalid property name ${name}`);
        super(binding, node, name, filterTexts);
        this.#filterTexts = filterTexts;
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
        if (!(this.binding.newBindingSummary?.exists(this.binding) ?? false))
            return;
        return this.binding.stateProperty.state[DirectryCallApiSymbol](this.binding.stateProperty.name, event, this.binding.parentContentBindings.currentLoopContext);
    }
    eventHandler(event) {
        // 再構築などでバインドが削除されている場合は処理しない
        if (!(this.binding.newBindingSummary?.exists(this.binding) ?? false))
            return;
        // event filter
        event = this.eventFilters.length > 0 ? FilterManager.applyFilter(event, this.eventFilters) : event;
        if ((Reflect.get(event, "noStopPropagation") ?? false) === false) {
            event.stopPropagation();
        }
        this.binding.updator?.addProcess(this.directlyCall, this, [event], this.binding.parentContentBindings?.currentLoopContext);
    }
}

const PREFIX$1 = "class.";
class ElementClass extends ElementBase {
    get className() {
        return this.nameElements[1];
    }
    getValue() {
        return this.element.classList.contains(this.className);
    }
    setValue(value) {
        if (typeof value !== "boolean")
            utils.raise(`ElementClass: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not boolean`);
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
    getValue() {
        return this.element.getAttribute(this.attributeName);
    }
    setValue(value) {
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
    getValue() {
        return this.htmlElement.style.getPropertyValue(this.styleName);
    }
    setValue(value) {
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
    getValue() {
        return super.getValue();
    }
    setValue(value) {
        try {
            this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](this.propertyName, undefined);
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
        this.thisComponent.props[BindPropertySymbol](this.binding.stateProperty.name, this.propertyName, () => this.binding.parentContentBindings.currentLoopContext);
    }
    /**
     * 更新後処理
     */
    postUpdate(propertyAccessBystatePropertyKey) {
        const statePropertyName = this.binding.stateProperty.name;
        for (const [key, propertyAccessor] of propertyAccessBystatePropertyKey.entries()) {
            const patternInfo = getPatternInfo(propertyAccessor.pattern);
            if (propertyAccessor.pattern === statePropertyName ||
                patternInfo.patternPaths.includes(statePropertyName)) {
                const remain = propertyAccessor.pattern.slice(statePropertyName.length);
                this.thisComponent.states.current[UpdatedCallbackSymbol]([{ name: `${this.propertyName}${remain}`, indexes: propertyAccessor.loopIndexes?.values }]);
                this.thisComponent.states.current[NotifyForDependentPropsApiSymbol](`${this.propertyName}${remain}`, propertyAccessor.loopIndexes);
            }
        }
    }
    equals(value) {
        return false;
    }
}

const setOfPrimitiveType = new Set(["boolean", "number", "string"]);
/**
 * Exclude from GC
 */
class RepeatKeyed extends Loop {
    #fromIndexByValue = new Map; // 複数同じ値がある場合を考慮
    #lastIndexes = new Set;
    #setOfNewIndexes = new Set;
    #lastChildByNewIndex = new Map;
    #lastValue = [];
    getValue() {
        return this.#lastValue;
    }
    setValue(values) {
        if (!Array.isArray(values))
            utils.raise(`RepeatKeyed: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`);
        const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
        const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
        const wildCardName = this.binding.statePropertyName + ".*";
        this.revisionUpForLoop();
        this.#fromIndexByValue.clear();
        this.#lastIndexes.clear();
        this.#setOfNewIndexes.clear();
        this.#lastChildByNewIndex.clear();
        const children = this.binding.childrenContentBindings;
        const valuesLength = values.length;
        let appendOnly = true;
        for (let newIndex = 0; newIndex < valuesLength; newIndex++) {
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
                this.#lastChildByNewIndex.set(newIndex, children[lastIndex]);
                appendOnly = false;
            }
        }
        for (let i = 0; i < children.length; i++) {
            if (this.#lastIndexes.has(i))
                continue;
            children[i].dispose();
        }
        const uuid = this.uuid;
        const binding = this.binding;
        if (appendOnly) {
            const nextNode = this.node.nextSibling;
            const parentNode = this.node.parentNode ?? utils.raise("parentNode is null");
            for (let vi = 0; vi < valuesLength; vi++) {
                const contentBindings = createContentBindings(uuid, binding);
                children[vi] = contentBindings;
                this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, vi, () => {
                    contentBindings.rebuild();
                });
                parentNode.insertBefore(contentBindings.fragment, nextNode);
            }
        }
        else {
            let beforeContentBindings;
            const parentNode = this.node.parentNode ?? utils.raise("parentNode is null");
            for (let i = 0; i < valuesLength; i++) {
                const newIndex = i;
                let contentBindings;
                const beforeNode = beforeContentBindings?.lastChildNode ?? this.node;
                if (this.#setOfNewIndexes.has(newIndex)) {
                    // 元のインデックスにない場合（新規）
                    contentBindings = createContentBindings(uuid, binding);
                    children[newIndex] = contentBindings;
                    this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
                        contentBindings.rebuild();
                    });
                    parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling);
                }
                else {
                    // 元のインデックスがある場合（既存）
                    contentBindings = this.#lastChildByNewIndex.get(newIndex) ?? utils.raise("contentBindings is undefined");
                    if (contentBindings.childNodes[0]?.previousSibling !== beforeNode) {
                        contentBindings.removeChildNodes();
                        children[newIndex] = contentBindings;
                        this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
                            contentBindings.rebuild();
                        });
                        parentNode.insertBefore(contentBindings.fragment, beforeNode.nextSibling);
                    }
                    else {
                        children[newIndex] = contentBindings;
                        if (this.binding.updator?.isFullRebuild) {
                            this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, newIndex, () => {
                                contentBindings.rebuild();
                            });
                        }
                    }
                }
                beforeContentBindings = contentBindings;
            }
        }
        if (valuesLength < children.length) {
            children.length = valuesLength;
        }
        this.#lastValue = values.slice();
    }
    applyToChildNodes(setOfIndex) {
        this.revisionUpForLoop();
        const uuid = this.uuid;
        const binding = this.binding;
        const wildcardPaths = this.binding.stateProperty.propInfo?.wildcardPaths;
        const parentLastWildCard = wildcardPaths?.[wildcardPaths.length - 1];
        const wildCardName = this.binding.statePropertyName + ".*";
        const contentBindingsByValue = new Map;
        for (const index of setOfIndex) {
            const contentBindings = this.binding.childrenContentBindings[index];
            if (typeof contentBindings === "undefined")
                continue;
            const oldValue = this.#lastValue[index];
            const typeofOldValue = typeof oldValue;
            if (typeofOldValue === "undefined")
                continue;
            if (setOfPrimitiveType.has(typeofOldValue))
                continue;
            contentBindings.removeChildNodes();
            contentBindingsByValue.set(oldValue, contentBindings);
        }
        const updatedBindings = [];
        for (const index of Array.from(setOfIndex).sort()) {
            const newValue = this.binding.stateProperty.getChildValue(index);
            const typeofNewValue = typeof newValue;
            if (typeofNewValue === "undefined")
                continue;
            if (setOfPrimitiveType.has(typeofNewValue))
                continue;
            let contentBindings = contentBindingsByValue.get(newValue);
            if (typeof contentBindings === "undefined") {
                contentBindings = createContentBindings(uuid, binding);
                this.binding.replaceChildContentBindings(contentBindings, index);
                this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
                    contentBindings?.rebuild();
                });
                updatedBindings.push(...contentBindings.allChildBindings);
            }
            else {
                this.binding.replaceChildContentBindings(contentBindings, index);
                this.binding.updator?.namedLoopIndexesStack.setSubIndex(parentLastWildCard, wildCardName, index, () => {
                    contentBindings?.rebuild();
                });
                updatedBindings.push(...contentBindings.allChildBindings);
            }
        }
        this.#lastValue = this.binding.stateProperty.getValue().slice();
    }
    initialize() {
        super.initialize();
        this.#lastValue = [];
    }
    dispose() {
        super.dispose();
        this.#lastValue = [];
    }
}

class PopoverTarget extends ElementBase {
    #targetId = "";
    get propertyName() {
        return this.nameElements[1];
    }
    get targetId() {
        return this.#targetId;
    }
    get target() {
        const target = document.getElementById(this.#targetId);
        if (target?.isQuelComponent !== true) {
            utils.raise("PopoverTarget: not Quel Component");
        }
        return target;
    }
    get button() {
        if (this.node instanceof HTMLButtonElement) {
            return this.node;
        }
        if (this.node instanceof HTMLInputElement) {
            return this.node;
        }
        utils.raise("PopoverTarget: not button element");
    }
    constructor(binding, node, name, filters) {
        if (!(node instanceof HTMLButtonElement) && !(node instanceof HTMLInputElement && node.type === "button")) {
            utils.raise("PopoverTarget: not button element");
        }
        if (!node.hasAttribute("popovertarget")) {
            utils.raise("PopoverTarget: missing popovertarget attribute");
        }
        super(binding, node, name, filters);
        this.#targetId = node.getAttribute("popovertarget");
    }
    initialize() {
        super.initialize();
        this.binding.defaultEventHandler =
            (popoverTarget => event => popoverTarget.registerCurrentButton())(this);
    }
    get applicable() {
        // ポップオーバーがオープンしているかどうかの判定
        // see https://blog.asial.co.jp/3940/
        const popoverOpened = this.target?.matches(":popover-open") ?? false;
        if (this.binding.component?.popoverInfo.currentButton === this.button && popoverOpened) {
            return true;
        }
        return false;
    }
    registerCurrentButton() {
        // ボタン押下時、ボタンを登録する
        this.binding.component?.popoverInfo.addBinding(this.button, this.binding);
        const popoverInfo = this.binding.component?.popoverInfo ?? utils.raise("PopoverTarget: no popoverInfo");
        popoverInfo.currentButton = this.button;
        // ボタンのバインドを設定する
        // ToDo: ここでバインドすべきか、それともtarget側でするべきか？
        const allBindings = Array.from(this.binding.component?.newBindingSummary?.allBindings ?? []);
        const buttonBindings = allBindings.filter(binding => (binding.nodeProperty instanceof PopoverTarget) && (binding.nodeProperty.node === this.node));
        const props = this.target.props;
        for (const binding of buttonBindings) {
            const popoverTarget = binding.nodeProperty;
            if (!props[CheckDuplicateSymbol](popoverTarget.binding.statePropertyName, popoverTarget.propertyName)) {
                const getLoopContext = (binding) => () => {
                    const component = binding.component ?? utils.raise("PopoverTarget: no component");
                    const button = component.popoverInfo?.currentButton ?? utils.raise("PopoverTarget: no currentButton");
                    const popoverButton = component.popoverInfo?.get(button);
                    return popoverButton?.loopContext;
                };
                props[BindPropertySymbol](popoverTarget.binding.statePropertyName, popoverTarget.propertyName, getLoopContext(popoverTarget.binding));
            }
        }
    }
}

const nodePropertyConstructorByNameByIsComment = {
    0: {
        "class": ElementClassName,
        "checkbox": Checkbox,
        "radio": Radio,
    },
    1: {
        "if": Branch,
    },
};
const createNodeProperty = (NodeProertyClass) => (binding, node, name, filters) => {
    return Reflect.construct(NodeProertyClass, [binding, node, name, filters]);
};
const nodePropertyConstructorByFirstName = {
    "class": ElementClass,
    "attr": ElementAttribute,
    "style": ElementStyle,
    "props": ComponentProperty,
    "target": PopoverTarget,
};
function _getNodePropertyConstructor(isComment, isElement, propertyName, useKeyed) {
    let nodePropertyConstructor;
    do {
        nodePropertyConstructor = nodePropertyConstructorByNameByIsComment[isComment ? 1 : 0][propertyName];
        if (typeof nodePropertyConstructor !== "undefined")
            break;
        if (isComment && propertyName === "loop") {
            nodePropertyConstructor = useKeyed ? RepeatKeyed : Repeat;
            break;
        }
        if (isComment)
            utils.raise(`NodePropertyCreateor: unknown node property ${propertyName}`);
        const nameElements = propertyName.split(".");
        nodePropertyConstructor = nodePropertyConstructorByFirstName[nameElements[0]];
        if (typeof nodePropertyConstructor !== "undefined")
            break;
        if (isElement) {
            if (propertyName.startsWith("on")) {
                nodePropertyConstructor = ElementEvent;
            }
            else {
                nodePropertyConstructor = ElementProperty;
            }
        }
        else {
            nodePropertyConstructor = NodeProperty;
        }
    } while (false);
    return createNodeProperty(nodePropertyConstructor);
}
const _cache$4 = {};
/**
 * バインドのノードプロパティのコンストラクタを取得する
 * @param node ノード
 * @param propertyName プロパティ名
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {NodePropertyConstructor} ノードプロパティのコンストラクタ
 */
function getNodePropertyConstructor(node, propertyName, useKeyed) {
    const isComment = node instanceof Comment;
    const isElement = node instanceof Element;
    const key = isComment + "\t" + isElement + "\t" + propertyName + "\t" + useKeyed;
    return _cache$4[key] ?? (_cache$4[key] = _getNodePropertyConstructor(isComment, isElement, propertyName, useKeyed));
}

class StateProperty {
    get state() {
        return this.#binding.state ?? utils.raise("StateProperty: state is undefined");
    }
    #name;
    get name() {
        return this.#name;
    }
    #childName;
    get childName() {
        return this.#childName;
    }
    #propInfo;
    get propInfo() {
        return this.#propInfo;
    }
    #lastWildCard;
    get lastWildCard() {
        return this.#lastWildCard;
    }
    #level;
    get level() {
        return this.#level;
    }
    get loopIndexes() {
        return this.binding.updator?.namedLoopIndexesStack?.getLoopIndexes(this.lastWildCard);
    }
    getValue() {
        return this.state[GetByPropInfoSymbol](this.propInfo);
    }
    setValue(value) {
        const setValue = (value) => {
            this.state[SetByPropInfoSymbol](this.propInfo, value);
        };
        if (value instanceof MultiValue) {
            const thisValue = this.getValue();
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
    #fileterTexts;
    #filters;
    get filters() {
        if (typeof this.#filters === "undefined") {
            this.#filters = Filters.create(this.#fileterTexts, this.binding.outputFilterManager);
        }
        return this.#filters;
    }
    getFilteredValue() {
        const value = this.getValue();
        return this.filters.length === 0 ? value : FilterManager.applyFilter(value, this.filters);
    }
    // setValueToState()の対象かどうか
    get applicable() {
        return true;
    }
    #binding;
    get binding() {
        return this.#binding;
    }
    constructor(binding, name, filterTexts) {
        this.#binding = binding;
        this.#name = name;
        this.#childName = name + ".*";
        this.#propInfo = getPropInfo(name);
        this.#level = this.#propInfo.wildcardCount;
        this.#fileterTexts = filterTexts;
        this.#lastWildCard = this.#propInfo.wildcardPaths[this.#propInfo.wildcardPaths.length - 1];
    }
    /**
     * 初期化処理
     * 特に何もしない
     */
    initialize() {
    }
    getChildValue(index) {
        return this.binding.updator?.namedLoopIndexesStack?.setSubIndex(this.#name, this.#childName, index, () => {
            const propInfo = getPropInfo(this.#childName);
            return this.state[GetByPropInfoSymbol](propInfo);
        });
    }
    setChildValue(index, value) {
        return this.binding.updator?.namedLoopIndexesStack?.setSubIndex(this.#name, this.#childName, index, () => {
            const propInfo = getPropInfo(this.#childName);
            return this.state[SetByPropInfoSymbol](propInfo, value);
        });
    }
    dispose() {
    }
}

const regexp$1 = RegExp(/^\$[0-9]+$/);
class ContextIndex extends StateProperty {
    #index;
    get index() {
        return this.#index;
    }
    getValue() {
        return this.binding.parentContentBindings?.currentLoopContext?.loopIndexes.at(this.index) ?? utils.raise(`ContextIndex: invalid index ${this.name}`);
    }
    get loopIndexes() {
        return undefined;
    }
    get indexes() {
        return [];
    }
    constructor(binding, name, filters) {
        if (!regexp$1.test(name))
            utils.raise(`ContextIndex: invalid name ${name}`);
        super(binding, name, filters);
        this.#index = Number(name.slice(1)) - 1;
    }
}

const regexp = RegExp(/^\$[0-9]+$/);
const createStateProperty = (StatePropertyConstructor) => (binding, name, filters) => {
    return Reflect.construct(StatePropertyConstructor, [binding, name, filters]);
};
/**
 * バインドのステートプロパティのコンストラクタを取得する
 * @param propertyName
 * @returns {StatePropertyConstructor} ステートプロパティのコンストラクタ
 */
function getStatePropertyConstructor(propertyName) {
    const statePropertyConstructor = regexp.test(propertyName) ? ContextIndex : StateProperty;
    return createStateProperty(statePropertyConstructor);
}

/**
 * バインドのノードプロパティとステートプロパティのコンストラクタを取得する
 * @param node ノード
 * @param nodePropertyName ノードプロパティ名
 * @param statePropertyName ステートプロパティ名
 * @param useKeyed キー付きのプロパティを使用するかどうか
 * @returns {PropertyConstructors} プロパティコンストラクタ
 */
function getPropertyConstructors(node, nodePropertyName, statePropertyName, useKeyed) {
    return {
        nodePropertyConstructor: getNodePropertyConstructor(node, nodePropertyName, useKeyed),
        statePropertyConstructor: getStatePropertyConstructor(statePropertyName),
    };
}

function setValueToState(nodeProperty, stateProperty) {
    if (!stateProperty.applicable)
        return;
    stateProperty.setValue(nodeProperty.getFilteredValue());
}

function setValueToNode(binding, updator, nodeProperty, stateProperty) {
    if (!nodeProperty.applicable)
        return;
    updator?.applyNodeUpdatesByBinding(binding, () => {
        // 値が同じかどうかの判定をするよりも、常に値をセットするようにしたほうが速い
        nodeProperty.setValue(stateProperty.getFilteredValue() ?? "");
    });
}

let id = 1;
class Binding {
    #id;
    #nodeProperty;
    #stateProperty;
    // ToDo: このプロパティはchildrenとしたほうがいいのか？
    childrenContentBindings = [];
    // ToDo: このプロパティはparentとしたほうがいいのか？
    #parentContentBindings;
    get id() {
        return this.#id.toString();
    }
    // todo: このgetterを使うか検討
    get nodeProperty() {
        return this.#nodeProperty;
    }
    // todo: このgetterを使うか検討
    get stateProperty() {
        return this.#stateProperty;
    }
    get statePropertyName() {
        return this.#stateProperty.name;
    }
    get parentContentBindings() {
        return this.#parentContentBindings;
    }
    get loopable() {
        return this.#nodeProperty.loopable;
    }
    get expandable() {
        return this.#nodeProperty.expandable;
    }
    get component() {
        return this.#parentContentBindings.component;
    }
    get updator() {
        return this.component?.updator;
    }
    get newBindingSummary() {
        return this.component?.newBindingSummary;
    }
    get state() {
        return this.component?.states.current;
    }
    get selectorName() {
        return this.component?.selectorName;
    }
    get eventFilterManager() {
        return this.component?.eventFilterManager ?? utils.raise("Binding.eventFilterManager: undefined");
    }
    get inputFilterManager() {
        return this.component?.inputFilterManager ?? utils.raise("Binding.inputFilterManager: undefined");
    }
    get outputFilterManager() {
        return this.component?.outputFilterManager ?? utils.raise("Binding.outputFilterManager: undefined");
    }
    constructor(contentBindings, node, nodePropertyName, nodePropertyConstructor, outputFilters, statePropertyName, statePropertyConstructor, inputFilters) {
        this.#id = ++id;
        this.#parentContentBindings = contentBindings;
        this.#nodeProperty = nodePropertyConstructor(this, node, nodePropertyName, outputFilters);
        this.#stateProperty = statePropertyConstructor(this, statePropertyName, inputFilters);
    }
    /**
     */
    execDefaultEventHandler(event) {
        if (!(this.newBindingSummary?.exists(this) ?? false))
            return;
        event.stopPropagation();
        const { nodeProperty, stateProperty } = this;
        this.updator?.addProcess(setValueToState, undefined, [nodeProperty, stateProperty], this.parentContentBindings?.currentLoopContext);
    }
    #defaultEventHandler = undefined;
    get defaultEventHandler() {
        if (typeof this.#defaultEventHandler === "undefined") {
            this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
        }
        return this.#defaultEventHandler;
    }
    set defaultEventHandler(value) {
        this.#defaultEventHandler = value;
    }
    initialize() {
        this.nodeProperty.initialize();
        this.stateProperty.initialize();
    }
    appendChildContentBindings(contentBindings) {
        if (!this.expandable)
            utils.raise("Binding.appendChild: not expandable");
        this.childrenContentBindings.push(contentBindings);
        // DOM
        const lastChildContentBindings = this.childrenContentBindings[this.childrenContentBindings.length - 1];
        const parentNode = this.nodeProperty.node.parentNode;
        const beforeNode = lastChildContentBindings?.lastChildNode ?? this.nodeProperty.node;
        parentNode?.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
    }
    replaceChildContentBindings(contentBindings, index) {
        if (!this.expandable)
            utils.raise("Binding.replaceChild: not expandable");
        this.childrenContentBindings[index] = contentBindings;
        // DOM
        const lastChildContentBindings = this.childrenContentBindings[index - 1];
        const parentNode = this.nodeProperty.node.parentNode;
        const beforeNode = lastChildContentBindings?.lastChildNode ?? this.nodeProperty.node;
        parentNode?.insertBefore(contentBindings.fragment, beforeNode.nextSibling ?? null);
    }
    removeAllChildrenContentBindings() {
        const removedContentBindings = this.childrenContentBindings;
        this.childrenContentBindings = [];
        for (let i = 0; i < removedContentBindings.length; i++) {
            removedContentBindings[i].dispose();
        }
        return removedContentBindings;
    }
    dispose() {
        this.newBindingSummary?.delete(this);
        this.nodeProperty.dispose();
        this.stateProperty.dispose();
        this.childrenContentBindings.forEach(contentBindings => contentBindings.dispose());
        this.childrenContentBindings = [];
    }
    rebuild() {
        const { updator, nodeProperty, stateProperty } = this;
        setValueToNode(this, updator, nodeProperty, stateProperty);
    }
    updateNodeForNoRecursive() {
        // rebuildで再帰的にupdateするnodeが決まるため
        // 再帰的に呼び出す必要はない
        if (!this.expandable) {
            const { updator, nodeProperty, stateProperty } = this;
            setValueToNode(this, updator, nodeProperty, stateProperty);
        }
    }
}
function createBinding(contentBindings, node, nodePropertyName, nodePropertyConstructor, outputFilters, statePropertyName, statePropertyConstructor, inputFilters) {
    const binding = new Binding(contentBindings, node, nodePropertyName, nodePropertyConstructor, outputFilters, statePropertyName, statePropertyConstructor, inputFilters);
    binding.initialize();
    return binding;
}

/**
 * バインディング情報を元にバインディングを作成する関数を返す
 * @param bindTextInfo バインドテキスト情報
 * @param propertyCreators プロパティコンストラクタ
 * @returns {IBinding} バインディング
 */
const getCreateBinding = (bindTextInfo, propertyCreators) => (contentBindings, node) => createBinding(contentBindings, node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyConstructor, bindTextInfo.inputFilters, bindTextInfo.stateProperty, propertyCreators.statePropertyConstructor, bindTextInfo.outputFilters);

/**
 * 最上位ノードからのルート（道順）インデックスの配列を計算する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param node ノード
 * @returns {NodeRoute} ルートインデックスの配列
 */
function computeNodeRoute(node) {
    let routeIndexes = [];
    while (node.parentNode !== null) {
        routeIndexes = [Array.from(node.parentNode.childNodes).indexOf(node), ...routeIndexes];
        node = node.parentNode;
    }
    return routeIndexes;
}

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";
const setDefaultEventHandlerByElement = (element) => (binding, eventType = DEFAULT_EVENT_TYPE) => element.addEventListener(eventType, event => binding.defaultEventHandler(event));
function initializeHTMLElement(node, acceptInput, bindings, defaultName) {
    const element = node;
    // set event handler
    let hasDefaultEvent = false;
    let defaultBinding = null;
    let radioBinding = null;
    let checkboxBinding = null;
    let targetPopoverBinding = null;
    for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
        radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
        checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
        targetPopoverBinding = (binding.nodeProperty.constructor === PopoverTarget) ? binding : targetPopoverBinding;
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
        else if (targetPopoverBinding) {
            setDefaultEventHandler(targetPopoverBinding, "click");
        }
        else if (defaultBinding && acceptInput) {
            // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
            // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
            // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
            // ・nodeが入力系（input, textarea, select） → 入力系に限定
            setDefaultEventHandler(defaultBinding);
        }
    }
}
const thru = () => { };
const initializeNodeByNodeType = {
    HTMLElement: initializeHTMLElement,
    SVGElement: thru,
    Text: thru,
    Template: thru,
};
/**
 * ノードの初期化処理
 * 入力可のノードの場合、デフォルトイベントハンドラを設定する
 * @param nodeInfo ノード情報
 * @returns {function} ノードの初期化処理
 */
const initializeForNode = (nodeInfo) => (node, bindings) => initializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.acceptInput, bindings, nodeInfo.defaultProperty);

class BindingNode {
    nodeType;
    nodeRoute;
    nodeRouteKey;
    bindTexts;
    acceptInput;
    defaultProperty;
    initializeForNode;
    constructor(nodeType, nodeRoute, nodeRouteKey, bindTexts, acceptInput, defaultProperty) {
        this.nodeType = nodeType;
        this.nodeRoute = nodeRoute;
        this.nodeRouteKey = nodeRouteKey;
        this.bindTexts = bindTexts;
        this.acceptInput = acceptInput;
        this.defaultProperty = defaultProperty;
        this.initializeForNode = initializeForNode(this);
    }
}
/**
 * バインディングノードを生成する
 * @param node ノード
 * @param nodeType ノードタイプ
 * @param bindText バインドテキスト
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {IBindingNode} バインディングノード
 */
function createBindingNode(node, nodeType, bindText, useKeyed) {
    // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
    node = replaceTextNodeFromComment(node, nodeType);
    // data-bind属性を削除する
    removeDataBindAttribute(node, nodeType);
    const acceptInput = canNodeAcceptInput(node, nodeType);
    const defaultProperty = getDefaultPropertyForNode(node, nodeType) ?? "";
    const parsedBindTexts = parseBindText(bindText, defaultProperty);
    const bindTexts = [];
    for (let j = 0; j < parsedBindTexts.length; j++) {
        const parsedBindText = parsedBindTexts[j];
        const { nodeProperty, stateProperty } = parsedBindText;
        const propertyConstructors = getPropertyConstructors(node, nodeProperty, stateProperty, useKeyed);
        bindTexts.push({ ...parsedBindText, ...propertyConstructors, createBinding: getCreateBinding(parsedBindText, propertyConstructors) });
    }
    const nodeRoute = computeNodeRoute(node);
    const nodeRouteKey = nodeRoute.join(",");
    return new BindingNode(nodeType, nodeRoute, nodeRouteKey, bindTexts, acceptInput, defaultProperty);
}

const BIND_DATASET$1 = "bind";
/** get text to bind from data-bind attribute */
const getBindTextFromHTMLElement = (node) => node.dataset[BIND_DATASET$1] ?? "";
/** get text to bind from data-bind attribute */
const getBindTextFromSVGElement = (node) => node.dataset[BIND_DATASET$1] ?? "";
/** get text to bind from textContent property */
const getBindTextFromText = (node) => node.textContent?.slice(3) ?? "";
/** get text to bind from template's data-bind attribute, looking up by textContent property */
const getBindTextFromTemplate = (node) => getTemplateByUUID(node.textContent?.slice(3) ?? "")?.dataset[BIND_DATASET$1] ?? "";
const bindTextByNodeType = {
    HTMLElement: getBindTextFromHTMLElement,
    SVGElement: getBindTextFromSVGElement,
    Text: getBindTextFromText,
    Template: getBindTextFromTemplate,
};
/**
 * バインドテキストをノードから取得
 * HTML要素の場合はdata-bind属性から、テキストノードの場合はtextContentから取得
 * @param node ノード
 * @param nodeType ノードタイプ
 * @returns {string} バインドテキスト
 */
function getBindTextByNodeType(node, nodeType) {
    return bindTextByNodeType[nodeType](node);
}

/**
 * "@@:"もしくは"@@|"で始まるコメントノードを取得する
 */
const isCommentNode = (node) => node instanceof Comment && ((node.textContent?.startsWith("@@:") ?? false) || (node.textContent?.startsWith("@@|") ?? false));
/**
 * ノードツリーからexpandableなコメントノードを取得する
 * expandableなコメントノードとは、"@@:"もしくは"@@|"で始まるコメントノードのこと
 * {{ if: }}や{{ loop: }}を置き換えたもの指すためのコメントノード
 * @param node ノード
 * @returns {Comment[]} コメントノード
 */
function getExpandableComments(node) {
    return Array.from(node.childNodes).flatMap(node => getExpandableComments(node).concat(isCommentNode(node) ? node : []));
}

const createNodeKey = (node) => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");
const nodeTypeByNodeKey = {};
const getNodeTypeByNode = (node) => (node instanceof Comment && node.textContent?.[2] === ":") ? "Text" :
    (node instanceof HTMLElement) ? "HTMLElement" :
        (node instanceof Comment && node.textContent?.[2] === "|") ? "Template" :
            (node instanceof SVGElement) ? "SVGElement" : utils.raise(`Unknown NodeType: ${node.nodeType}`);
/**
 * ノードのタイプを取得
 * @param node ノード
 * @param nodeKey ノードキー
 * @returns {NodeType} ノードタイプ
 */
function getNodeType(node, nodeKey = createNodeKey(node)) {
    return nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
}

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;
/**
 * HTMLテンプレートからバインドノード情報を抽出する
 * @param template テンプレート
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {IBindingNode[]} バインドノード情報
 */
function extractBindNodeInfosFromTemplate(template, useKeyed) {
    const nodeInfos = [];
    const rootElement = template.content;
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getExpandableComments(rootElement));
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeType = getNodeType(node);
        const bindText = getBindTextByNodeType(node, nodeType);
        if (bindText.trim() === "")
            continue;
        nodeInfos[nodeInfos.length] = createBindingNode(nodes[i], nodeType, bindText, useKeyed);
    }
    return nodeInfos;
}

/**
 * ノードのルート（道順）インデックスの配列からノードを探す
 * @param node ノード
 * @param nodeRoute ノードルート
 * @returns {Node | undefined} 探したノード
 */
function findNodeByNodeRoute(node, nodeRoute) {
    for (let i = 0; (typeof node !== "undefined") && (i < nodeRoute.length); node = node.childNodes[nodeRoute[i++]])
        ;
    return node;
}

/**
 * HTMLテンプレートのコンテントからバインディング配列を作成する
 * @param content コンテント
 * @param contentBindings コンテントバインディング
 * @param bindingNodes バインディングノード
 * @returns {IBinding[]} バインディング配列
 */
function createBindings(content, contentBindings, bindingNodes) {
    const bindings = [];
    for (let i = 0; i < bindingNodes.length; i++) {
        const bindingNode = bindingNodes[i];
        const node = findNodeByNodeRoute(content, bindingNode.nodeRoute) ?? utils.raise(`Node not found: ${bindingNode.nodeRoute}`);
        const tempBindings = [];
        for (let j = 0; j < bindingNode.bindTexts.length; j++) {
            tempBindings[tempBindings.length] =
                bindingNode.bindTexts[j].createBinding(contentBindings, node); // push
        }
        bindingNode.initializeForNode(node, tempBindings);
        bindings.push(...tempBindings);
    }
    return bindings;
}

const UUID_DATASET = "uuid";
const _cache$3 = {};
class Binder {
    #template;
    #nodeInfos;
    constructor(template, useKeyed) {
        this.#template = template;
        this.#nodeInfos = extractBindNodeInfosFromTemplate(this.#template, useKeyed);
    }
    createBindings(content, contentBindings) {
        return createBindings(content, contentBindings, this.#nodeInfos);
    }
}
/**
 * バインドを生成するためのクラスを生成します。
 * @param template テンプレート
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {IBinder}
 */
function createBinder(template, useKeyed) {
    const uuid = template.dataset[UUID_DATASET] ?? utils.raise("uuid not found");
    return _cache$3[uuid] ?? (_cache$3[uuid] = new Binder(template, useKeyed));
}

class LoopContext {
    #revision;
    #contentBindings;
    #index;
    #loopIndexes;
    #serialLoopIndexes;
    #namedLoopContexts;
    #loopTreeNodesByName = {};
    #loopTreeLoopableNodesByName = {};
    constructor(contentBindings) {
        this.#contentBindings = contentBindings;
    }
    get contentBindings() {
        return this.#contentBindings;
    }
    get patternName() {
        return this.contentBindings.patternName;
    }
    get parentPatternName() {
        const patternInfo = getPatternInfo(this.patternName);
        return patternInfo.wildcardPaths.at(-2);
    }
    get parentNamedLoopContext() {
        // インデックスは変わるが親子関係は変わらないので、checkRevisionは不要
        const parentPatternName = this.parentPatternName;
        if (typeof parentPatternName !== "undefined") {
            return this.namedLoopContexts[parentPatternName];
        }
    }
    get parentLoopContext() {
        let tmpContentBindings = this.contentBindings.parentBinding?.parentContentBindings;
        while (typeof tmpContentBindings !== "undefined") {
            if (typeof tmpContentBindings.loopContext !== "undefined" && tmpContentBindings.loopContext !== this) {
                return tmpContentBindings.loopContext;
            }
            tmpContentBindings = tmpContentBindings.parentBinding?.parentContentBindings;
        }
    }
    get index() {
        this.checkRevision();
        if (typeof this.#index === "undefined") {
            this.#index = this.contentBindings.parentBinding?.childrenContentBindings.indexOf(this.contentBindings) ??
                utils.raise("index is undefined");
        }
        return this.#index;
    }
    get serialLoopIndexes() {
        this.checkRevision();
        if (typeof this.#serialLoopIndexes === "undefined") {
            this.#serialLoopIndexes = (typeof this.parentNamedLoopContext === "undefined") ?
                createLoopIndexes(undefined, this.index) : this.parentNamedLoopContext.loopIndexes.add(this.index);
        }
        return this.#serialLoopIndexes;
    }
    get loopIndexes() {
        this.checkRevision();
        if (typeof this.#loopIndexes === "undefined") {
            this.#loopIndexes = (typeof this.parentLoopContext === "undefined") ?
                createLoopIndexes(undefined, this.index) : this.parentLoopContext.loopIndexes.add(this.index);
        }
        return this.#loopIndexes;
    }
    get namedLoopContexts() {
        if (typeof this.#namedLoopContexts === "undefined") {
            this.#namedLoopContexts =
                Object.assign(this.parentLoopContext?.namedLoopContexts ?? {}, { [this.patternName]: this });
        }
        return this.#namedLoopContexts;
    }
    // ルート検索用
    get loopTreeNodesByName() {
        return this.#loopTreeNodesByName;
    }
    // ルート検索用
    get loopTreeLoopableNodesByName() {
        return this.#loopTreeLoopableNodesByName;
    }
    checkRevision() {
        const revision = this.contentBindings.parentBinding?.nodeProperty.revisionForLoop;
        if (typeof this.#revision === "undefined" || this.#revision !== revision) {
            this.#index = undefined;
            this.#loopIndexes = undefined;
            this.#serialLoopIndexes = undefined;
            this.#namedLoopContexts = undefined;
            return true;
        }
        return false;
    }
    dispose() {
        this.#index = undefined;
        this.#loopIndexes = undefined;
        this.#serialLoopIndexes = undefined;
        this.#namedLoopContexts = undefined;
    }
}
function createLoopContext(contentBindings) {
    return new LoopContext(contentBindings);
}

class ContentBindings {
    #uuid;
    #component;
    #template;
    #childBindings;
    #parentBinding;
    #loopContext;
    #childNodes;
    #fragment;
    #loopable = false;
    #useKeyed;
    #patternName;
    #localTreeNodes = new Set();
    get component() {
        return this.#component;
    }
    set component(value) {
        if (typeof value !== "undefined") {
            (this.#useKeyed !== value.useKeyed) && utils.raise("useKeyed is different");
        }
        this.#component = value;
    }
    get template() {
        if (typeof this.#template === "undefined") {
            this.#template = getTemplateByUUID(this.#uuid) ?? utils.raise("template is undefined");
        }
        return this.#template;
    }
    get childBindings() {
        if (typeof this.#childBindings === "undefined") {
            utils.raise("childBindings is undefined");
        }
        return this.#childBindings;
    }
    get parentBinding() {
        return this.#parentBinding;
    }
    set parentBinding(value) {
        if (typeof value !== "undefined") {
            (this.#loopable !== value.loopable) && utils.raise("loopable is different");
        }
        this.#parentBinding = value;
    }
    get loopContext() {
        return this.#loopContext;
    }
    get childNodes() {
        if (typeof this.#childNodes === "undefined") {
            utils.raise("childNodes is undefined");
        }
        return this.#childNodes;
    }
    get lastChildNode() {
        return this.childNodes[this.childNodes.length - 1];
    }
    get currentLoopContext() {
        if (typeof this.#loopContext === "undefined") {
            return this.parentContentBindings?.loopContext;
        }
        else {
            return this.#loopContext;
        }
    }
    get parentContentBindings() {
        return this.parentBinding?.parentContentBindings;
    }
    get fragment() {
        if (typeof this.#fragment === "undefined") {
            utils.raise("fragment is undefined");
        }
        return this.#fragment;
    }
    get allChildBindings() {
        const allChildBindings = [];
        for (let i = 0; i < this.childBindings.length; i++) {
            allChildBindings.push(this.childBindings[i]);
            for (let j = 0; j < this.childBindings[i].childrenContentBindings.length; j++) {
                allChildBindings.push(...this.childBindings[i].childrenContentBindings[j].allChildBindings);
            }
        }
        return allChildBindings;
    }
    get loopable() {
        return this.#loopable;
    }
    get useKeyed() {
        return this.#useKeyed;
    }
    get patternName() {
        return this.#patternName;
    }
    get localTreeNodes() {
        return this.#localTreeNodes;
    }
    constructor(uuid, useKeyed = false, loopable = false, patternName = "") {
        this.#uuid = uuid;
        this.#useKeyed = useKeyed;
        this.#loopable = loopable;
        this.#patternName = patternName;
        const binder = createBinder(this.template, this.useKeyed);
        this.#fragment = document.importNode(this.template.content, true); // See http://var.blog.jp/archives/76177033.html
        this.#childBindings = binder.createBindings(this.#fragment, this);
        this.#childNodes = Array.from(this.#fragment.childNodes);
        if (loopable) {
            this.#loopContext = createLoopContext(this);
            for (let i = 0; i < this.childBindings.length; i++) {
                const binding = this.childBindings[i];
                if (binding.stateProperty.lastWildCard !== this.patternName)
                    continue;
                this.#localTreeNodes.add(binding);
                this.#loopContext?.loopTreeNodesByName[binding.statePropertyName]?.add(binding) ??
                    (this.#loopContext.loopTreeNodesByName[binding.statePropertyName] = new Set([binding]));
            }
        }
    }
    removeChildNodes() {
        this.fragment.append.apply(this.fragment, this.childNodes);
    }
    /**
     * register bindings to summary
     */
    registerBindingsToSummary() {
        const newBindingSummary = this.component?.newBindingSummary ?? utils.raise("bindingSummary is undefined");
        for (let i = 0; i < this.childBindings.length; i++) {
            newBindingSummary.register(this.childBindings[i]);
        }
    }
    dispose() {
        // childrenBindingsの構造はそのまま保持しておく
        // 構造を保持しておくことで、再利用時に再構築する必要がなくなる
        // 構造は変化しない、変化するのは、bindingのchildrenContentBindings
        this.childBindings.forEach(binding => binding.dispose());
        this.loopContext?.dispose();
        this.#parentBinding = undefined;
        this.removeChildNodes();
        const key = `${this.#uuid}\t${this.#useKeyed}\t${this.#loopable}\t${this.#patternName}`;
        _cache$2[key]?.push(this) ?? (_cache$2[key] = [this]);
    }
    rebuild() {
        const selectValues = [];
        for (let i = 0; i < this.childBindings.length; i++) {
            const binding = this.childBindings[i];
            if (binding.nodeProperty.isSelectValue) {
                selectValues.push(binding);
            }
            else {
                binding.rebuild();
            }
        }
        for (let i = 0; i < selectValues.length; i++) {
            selectValues[i].rebuild();
        }
    }
}
const _cache$2 = {};
function createContentBindings(uuid, parentBinding) {
    const component = parentBinding.component ?? utils.raise("component is undefined");
    const useKeyed = component.useKeyed;
    const loopable = parentBinding.loopable;
    const patterName = loopable ? parentBinding.statePropertyName + ".*" : "";
    const key = `${uuid}\t${useKeyed}\t${loopable}\t${patterName}`;
    let contentBindings = _cache$2[key]?.pop();
    if (typeof contentBindings === "undefined") {
        contentBindings = new ContentBindings(uuid, useKeyed, loopable, patterName);
    }
    contentBindings.component = component;
    contentBindings.parentBinding = parentBinding;
    contentBindings.registerBindingsToSummary();
    return contentBindings;
}
function createRootContentBindings(component, uuid) {
    const useKeyed = component.useKeyed;
    const loopable = false;
    const key = `${uuid}\t${useKeyed}\t${loopable}\t`;
    let contentBindings = _cache$2[key]?.pop();
    if (typeof contentBindings === "undefined") {
        contentBindings = new ContentBindings(uuid, useKeyed, loopable);
    }
    contentBindings.component = component;
    contentBindings.registerBindingsToSummary();
    return contentBindings;
}

const CREATE_BUFFER_METHOD = "$createBuffer";
const FLUSH_BUFFER_METHOD = "$flushBuffer";
const callFuncBySymbol = {
    [DirectryCallApiSymbol]: ({ state, stateProxy, handler }) => async (prop, event, loopContext) => state[prop].apply(stateProxy, [event, ...(loopContext?.loopIndexes.values ?? [])]),
    [NotifyForDependentPropsApiSymbol]: ({ handler }) => (prop, loopIndexes) => handler.updator.addUpdatedStateProperty(createStatePropertyAccessor(prop, loopIndexes)),
    [GetDependentPropsApiSymbol]: ({ handler }) => () => handler.dependentProps,
    [ClearCacheApiSymbol]: ({ handler }) => () => handler.clearCache(),
    [CreateBufferApiSymbol]: ({ stateProxy }) => (component) => stateProxy[CREATE_BUFFER_METHOD]?.apply(stateProxy, [component]),
    [FlushBufferApiSymbol]: ({ stateProxy }) => (buffer, component) => stateProxy[FLUSH_BUFFER_METHOD]?.apply(stateProxy, [buffer, component]),
};
function getApiMethod(state, stateProxy, handler, prop) {
    return callFuncBySymbol[prop]?.({ state, stateProxy, handler });
}

const CONNECTED_EVENT = "connected";
const DISCONNECTED_EVENT = "disconnected";
const UPDATED_EVENT = "updated";
const createConnectedDetail = (...args) => ({});
const createDisconnectedDetail = (...args) => ({});
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
const applyCallback = (state, stateProxy, handler, prop) => async (...args) => {
    const returnValue = (state[callbackNameBySymbol[prop]])?.apply(stateProxy, args);
    dispatchCustomEvent(handler.element, callbackToEvent[prop], args);
    return returnValue;
};
function getCallbackMethod(state, stateProxy, handler, prop) {
    return (allCallbacks.has(prop)) ?
        (...args) => applyCallback(state, stateProxy, handler, prop)(...args) :
        undefined;
}

function existsProperty(baseClass, prop) {
    if (typeof baseClass.prototype === "undefined")
        return false;
    if (baseClass.prototype === Object.prototype)
        return false;
    if (typeof baseClass.prototype[prop] !== "undefined")
        return true;
    return existsProperty(Object.getPrototypeOf(baseClass), prop);
}
const permittedProps = new Set([
    "element", "addProcess", "viewRootElement ", "queryRoot",
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
/**
 * State内で使用するコンポーネントを生成する
 * アクセス制限をかけるためのProxyを生成する
 * @param component コンポーネントを元にProxyを生成する
 * @returns {IUserComponent} ユーザーコンポーネント
 */
function createUserComponent(component) {
    return new Proxy(component, new UserProxyHandler);
}

const GLOBALS_PROPERTY = "$globals";
const DEPENDENT_PROPS_PROPERTY = "$dependentProps";
const COMPONENT_PROPERTY = "$component";
const ADD_PROCESS_PROPERTY = "$addProcess";
const funcByName = {
    [GLOBALS_PROPERTY]: ({ handler }) => handler.element.globals, // component.globals,
    [DEPENDENT_PROPS_PROPERTY]: ({ state }) => state[DEPENDENT_PROPS_PROPERTY],
    [COMPONENT_PROPERTY]: ({ handler }) => createUserComponent(handler.element),
    [ADD_PROCESS_PROPERTY]: ({ handler, stateProxy }) => (func) => handler.updator.addProcess(func, stateProxy, [], handler.loopContext)
};
function getSpecialProps(state, stateProxy, handler, prop) {
    return funcByName[prop]?.({ state, stateProxy, handler, prop });
}

function getDescByNames(target) {
    const descByNames = {};
    let object = target;
    while (object !== Object.prototype) {
        const descs = Object.getOwnPropertyDescriptors(object);
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
const _cache$1 = new Map();
function getAccessorProperties(target) {
    let accessorProperties = _cache$1.get(target.constructor);
    if (typeof accessorProperties === "undefined") {
        accessorProperties = _getAccessorProperties(target);
        if ({}.constructor !== target.constructor)
            _cache$1.set(target.constructor, accessorProperties);
    }
    return accessorProperties;
}

/**
 * $dependentPropsを表現
 */
class DependentProps {
    defaultProps = new Set;
    propsByRefProp = {};
    constructor(props) {
        this.#setDependentProps(props);
    }
    setDefaultProp(pattern) {
        if (this.defaultProps.has(pattern))
            return;
        const patternInfo = getPatternInfo(pattern);
        for (let i = patternInfo.patternPaths.length - 1; i >= 1; i--) {
            const parentPattern = patternInfo.patternPaths[i - 1];
            const pattern = patternInfo.patternPaths[i];
            this.propsByRefProp[parentPattern]?.add(pattern) ??
                (this.propsByRefProp[parentPattern] = new Set([pattern]));
            this.defaultProps.add(pattern);
        }
    }
    #setDependentProps(props) {
        for (const [prop, refProps] of Object.entries(props)) {
            for (const refProp of refProps) {
                this.propsByRefProp[refProp]?.add(prop) ?? (this.propsByRefProp[refProp] = new Set([prop]));
            }
        }
    }
}
function createDependentProps(props) {
    return new DependentProps(props);
}

const DEPENDENT_PROPS = "$dependentProps";
const _cache = new Map;
function getStateInfo(state) {
    // readonlyとwritableで同じものを使う
    let stateProeprtyInfo = _cache.get(state);
    if (typeof stateProeprtyInfo === "undefined") {
        stateProeprtyInfo = {
            accessorProperties: new Set(getAccessorProperties(state)),
            dependentProps: createDependentProps(state[DEPENDENT_PROPS] ?? {})
        };
        _cache.set(state, stateProeprtyInfo);
    }
    return stateProeprtyInfo;
}

const findPropertyCallbackFn = (handler) => {
    return function (prop) {
        const dependentProps = handler.dependentProps;
        if (!dependentProps.defaultProps.has(prop)) {
            dependentProps.setDefaultProp(prop);
        }
    };
};

function getNamedLoopIndexesStackFn(handler) {
    return function () {
        return handler.updator.namedLoopIndexesStack;
    };
}

class Handler extends Handler$1 {
    #component;
    #accessorProperties;
    #dependentProps;
    #objectBySymbol;
    get accessorProperties() {
        return this.#accessorProperties;
    }
    get dependentProps() {
        return this.#dependentProps;
    }
    get element() {
        return this.#component;
    }
    get component() {
        return this.#component;
    }
    get updator() {
        return this.component.updator;
    }
    get loopContext() {
        return undefined;
    }
    constructor(component, base) {
        super();
        this.#component = component;
        const { accessorProperties, dependentProps } = getStateInfo(base);
        this.#accessorProperties = accessorProperties;
        this.#dependentProps = dependentProps;
        this.#objectBySymbol = {
            [AccessorPropertiesSymbol]: this.#accessorProperties,
            [DependenciesSymbol]: this.#dependentProps
        };
        this.#getterByType["symbol"] = (target, prop, receiver) => this.#getBySymbol.apply(this, [target, prop, receiver]);
        this.#getterByType["string"] = (target, prop, receiver) => this.#getByString.apply(this, [target, prop, receiver]);
    }
    findPropertyCallback = findPropertyCallbackFn(this);
    getNamedLoopIndexesStack = getNamedLoopIndexesStackFn(this);
    #getBySymbol(target, prop, receiver) {
        return this.#objectBySymbol[prop] ??
            getCallbackMethod(target, receiver, this, prop) ??
            getApiMethod(target, receiver, this, prop) ??
            undefined;
    }
    #getByString(target, prop, receiver) {
        return getSpecialProps(target, receiver, this, prop) ?? undefined;
    }
    #getterByType = {};
    get(target, prop, receiver) {
        return this.#getterByType[typeof prop]?.(target, prop, receiver) ?? super.get(target, prop, receiver);
    }
}

class ReadonlyHandler extends Handler {
    // MapよりObjectのほうが速かった。keyにconstructorやlengthがある場合は、Mapを選択
    cache = {};
    set(target, prop, value, receiver) {
        utils.raise("ReadonlyHandler: set is not allowed");
    }
}
function createReadonlyState(component, base) {
    return new Proxy(base, new ReadonlyHandler(component, base));
}

const notifyCallbackFn = (handler) => {
    return function (pattern, loopIndexes) {
        handler.updator.addUpdatedStateProperty(createStatePropertyAccessor(pattern, loopIndexes));
    };
};

class WritableHandler extends Handler {
    notifyCallback = notifyCallbackFn(this);
}
function createWritableState(component, base) {
    return new Proxy(base, new WritableHandler(component, base));
}

class States {
    #base;
    #readonlyState;
    #writableState;
    #_writable = false;
    constructor(base, readOnlyState, writableState) {
        this.#base = base;
        this.#readonlyState = readOnlyState;
        this.#writableState = writableState;
    }
    get base() {
        return this.#base;
    }
    get #writable() {
        return this.#_writable;
    }
    set #writable(value) {
        this.#_writable = value;
        if (value === false) {
            this.#readonlyState[ClearCacheApiSymbol]();
        }
    }
    get current() {
        return this.#writable ? this.#writableState : this.#readonlyState;
    }
    async asyncSetWritable(callback) {
        if (this.#writable)
            utils.raise(`States: already writable`);
        this.#writable = true;
        try {
            return await callback();
        }
        finally {
            this.#writable = false;
        }
    }
    setWritable(callback) {
        if (this.#writable)
            utils.raise("States: already writable");
        this.#writable = true;
        try {
            return callback();
        }
        finally {
            this.#writable = false;
        }
    }
}
function createStates(component, base, readOnlyState = createReadonlyState(component, base), writableState = createWritableState(component, base)) {
    return new States(base, readOnlyState, writableState);
}

const ADOPTED_VAR_NAME = '--adopted-css';
/**
 * trim
 */
const trim = (name) => name.trim();
/**
 * exclude empty name
 */
const excludeEmptyName = (name) => name.length > 0;
/**
 * get name list from component style variable '--adopted-css'
 */
/**
 * コンポーネントのスタイル属性の '--adopted-css' から名前リストを取得します
 * @param component コンポーネント
 * @returns {string[]} 名前リスト
 */
function getAdoptedCssNamesFromStyleValue(component) {
    // get adopted css names from component style variable '--adopted-css'
    return getComputedStyle(component)?.getPropertyValue(ADOPTED_VAR_NAME)?.split(" ").map(trim).filter(excludeEmptyName) ?? [];
}

class NewBindingSummary {
    allBindings = new Set();
    /**
     * ループコンテキストに紐づかないバインディングを登録する
     */
    noloopBindings = {};
    rootLoopableBindings = {};
    register(binding) {
        const loopContext = binding.parentContentBindings?.currentLoopContext;
        this.allBindings.add(binding);
        if (binding.loopable) {
            if (typeof loopContext === "undefined") {
                this.rootLoopableBindings[binding.statePropertyName]?.add(binding) ??
                    (this.rootLoopableBindings[binding.statePropertyName] = new Set([binding]));
            }
            else {
                loopContext.loopTreeLoopableNodesByName[binding.statePropertyName]?.add(binding) ??
                    (loopContext.loopTreeLoopableNodesByName[binding.statePropertyName] = new Set([binding]));
            }
        }
        if (binding.stateProperty.propInfo.wildcardCount === 0) {
            this.noloopBindings[binding.statePropertyName]?.add(binding) ??
                (this.noloopBindings[binding.statePropertyName] = new Set([binding]));
        }
        else {
            if (!binding.parentContentBindings.localTreeNodes.has(binding)) {
                const parentLoopContext = loopContext?.namedLoopContexts[binding.stateProperty.lastWildCard] ??
                    utils.raise("loopContext is undefined");
                parentLoopContext.loopTreeNodesByName[binding.statePropertyName]?.add(binding) ??
                    (parentLoopContext.loopTreeNodesByName[binding.statePropertyName] = new Set([binding]));
            }
        }
    }
    delete(binding) {
        const loopContext = binding.parentContentBindings?.currentLoopContext;
        this.allBindings.delete(binding);
        if (binding.loopable) {
            if (typeof loopContext === "undefined") {
                this.rootLoopableBindings[binding.statePropertyName]?.delete(binding);
            }
            else {
                loopContext.loopTreeLoopableNodesByName[binding.statePropertyName]?.delete(binding);
            }
        }
        if (binding.stateProperty.propInfo.wildcardCount === 0) {
            this.noloopBindings[binding.statePropertyName]?.delete(binding);
        }
        else {
            if (!binding.parentContentBindings.localTreeNodes.has(binding)) {
                const parentLoopContext = loopContext?.namedLoopContexts[binding.stateProperty.lastWildCard] ??
                    utils.raise("loopContext is undefined");
                parentLoopContext.loopTreeNodesByName[binding.statePropertyName]?.delete(binding);
            }
        }
    }
    exists(binding) {
        return this.allBindings.has(binding);
    }
    _search(loopContext, searchPath, loopIndexesIterator, wildcardPaths, index, resultBindings) {
        if (index < wildcardPaths.length) {
            const wildcardPath = wildcardPaths[index];
            const wildcardPathInfo = getPatternInfo(wildcardPath);
            const wildcardIndex = loopIndexesIterator.next().value ?? utils.raise(`loopIndexes.at(${index}) is null`);
            const wildcardParentPath = wildcardPathInfo.patternPaths.at(-2) ?? "";
            const loopBindings = typeof loopContext === "undefined" ?
                Array.from(this.rootLoopableBindings[wildcardParentPath]) :
                Array.from(loopContext.loopTreeLoopableNodesByName[wildcardParentPath]);
            for (let i = 0; i < loopBindings.length; i++) {
                // リストが削除されている場合があるのでチェック
                if (typeof loopBindings[i].childrenContentBindings[wildcardIndex] === "undefined")
                    continue;
                this._search(loopBindings[i].childrenContentBindings[wildcardIndex].loopContext, searchPath, loopIndexesIterator, wildcardPaths, index + 1, resultBindings);
            }
        }
        else {
            (typeof loopContext !== "undefined") ?
                resultBindings.push(...Array.from(loopContext.loopTreeNodesByName[searchPath] ?? [])) : [];
        }
    }
    gatherBindings(propertyAccessor) {
        let bindings;
        if (typeof propertyAccessor.loopIndexes === "undefined" || propertyAccessor.loopIndexes.size === 0) {
            bindings = Array.from(this.noloopBindings[propertyAccessor.pattern] ?? []);
        }
        else {
            bindings = [];
            this._search(undefined, propertyAccessor.pattern, propertyAccessor.loopIndexes.forward(), propertyAccessor.patternInfo.wildcardPaths, 0, bindings);
        }
        return bindings;
    }
}
function createNewBindingSummary() {
    return new NewBindingSummary();
}

const pseudoComponentByNode = new Map;
const getParentComponent = (_node) => {
    let node = _node;
    do {
        node = node.parentNode;
        if (node == null)
            return undefined;
        if (Reflect.get(node, "isQuelComponent") === true)
            return node;
        if (node instanceof ShadowRoot) {
            if (Reflect.get(node.host, "isQuelComponent") === true)
                return node.host;
            node = node.host;
        }
        const psuedoComponent = pseudoComponentByNode.get(node);
        if (typeof psuedoComponent !== "undefined")
            return psuedoComponent;
    } while (true);
};
const localStyleSheetByTagName = new Map;
/**
 * コンポーネントを拡張する
 * 拡張内容は以下の通り
 * - states: Stateの生成
 * - initialPromises: 初期化用Promise
 * - alivePromises: アライブ用Promise
 * - rootBindingManager: ルートバインディングマネージャ
 * - viewRootElement: 表示用ルート要素
 * - pseudoParentNode: 親ノード（use, case of useWebComponent is false）
 * - pseudoNode: ダミーノード（use, case of useWebComponent is false）
 * - newBindingSummary: 新規バインディングサマリ
 * - updator: アップデータ
 * - props: プロパティ
 * - globals: グローバルデータ
 * @param Base 元のコンポーネント
 * @returns {CustomComponent} 拡張されたコンポーネント
 */
function CustomComponent(Base) {
    return class extends Base {
        constructor(...args) {
            super();
            this.#states = createStates(this, Reflect.construct(this.State, [])); // create state
            this.#newBindingSummary = createNewBindingSummary();
            this.#initialPromises = Promise.withResolvers(); // promises for initialize
            this.#updator = createUpdator(this);
            this.#props = createProps(this);
            this.#globals = createGlobals(this);
        }
        get component() {
            return this;
        }
        #parentComponent;
        get parentComponent() {
            if (typeof this.#parentComponent === "undefined") {
                this.#parentComponent = getParentComponent(this);
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
        #states;
        get states() {
            return this.#states;
        }
        #rootBindingManager;
        get rootBindingManager() {
            return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
        }
        set rootBindingManager(bindingManager) {
            this.#rootBindingManager = bindingManager;
        }
        get viewRootElement() {
            return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode;
        }
        // alias view root element */
        get queryRoot() {
            return this.viewRootElement;
        }
        // parent node（use, case of useWebComponent is false）
        #pseudoParentNode;
        get pseudoParentNode() {
            return !this.useWebComponent ?
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
        // find parent shadow root, or document, for adoptedCSS 
        get shadowRootOrDocument() {
            let node = this.parentNode;
            while (node) {
                if (node instanceof ShadowRoot) {
                    return node;
                }
                node = node.parentNode;
            }
            return document;
        }
        #newBindingSummary;
        get newBindingSummary() {
            return this.#newBindingSummary;
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
            if (isAttachableShadowRoot(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
                const shadowRoot = this.attachShadow({ mode: 'open' });
                const names = getAdoptedCssNamesFromStyleValue(this);
                const styleSheets = getStyleSheetListByNames(names);
                if (typeof this.styleSheet !== "undefined") {
                    styleSheets.push(this.styleSheet);
                }
                shadowRoot.adoptedStyleSheets = styleSheets;
            }
            else {
                if (typeof this.styleSheet !== "undefined") {
                    let adoptedStyleSheet = this.styleSheet;
                    if (this.useLocalSelector) {
                        const localStyleSheet = localStyleSheetByTagName.get(this.tagName);
                        if (typeof localStyleSheet !== "undefined") {
                            adoptedStyleSheet = localStyleSheet;
                        }
                        else {
                            adoptedStyleSheet = localizeStyleSheet(this.styleSheet, this.selectorName);
                            localStyleSheetByTagName.set(this.tagName, adoptedStyleSheet);
                        }
                    }
                    const shadowRootOrDocument = this.shadowRootOrDocument;
                    const adoptedStyleSheets = shadowRootOrDocument.adoptedStyleSheets;
                    if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
                        shadowRootOrDocument.adoptedStyleSheets = adoptedStyleSheets.concat(adoptedStyleSheet);
                    }
                }
            }
            if (this.useOverscrollBehavior) {
                if (this.tagName === "DIALOG" || this.hasAttribute("popover")) {
                    this.style.overscrollBehavior = "contain";
                }
            }
            await this.states.asyncSetWritable(async () => {
                await this.states.current[ConnectedCallbackSymbol]();
            });
            // build binding tree and dom 
            const uuid = this.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
            this.rootBindingManager = createRootContentBindings(this, uuid);
            this.updator.namedLoopIndexesStack.setNamedLoopIndexes(createNamedLoopIndexesFromAccessor(), () => {
                this.rootBindingManager.rebuild();
            });
            if (this.useWebComponent) {
                // case of useWebComponent,
                // then append fragment block to viewRootElement
                this.viewRootElement.appendChild(this.rootBindingManager.fragment);
            }
            else {
                // case of no useWebComponent, 
                // then insert fragment block before pseudo node nextSibling
                this.viewRootElement.insertBefore(this.rootBindingManager.fragment, this.pseudoNode?.nextSibling ?? null);
                // child nodes add pseudoComponentByNode
                this.rootBindingManager.childNodes.forEach(node => pseudoComponentByNode.set(node, this));
            }
        }
        async connectedCallback() {
            try {
                // wait for parent component initialize
                if (this.parentComponent) {
                    await this.parentComponent.initialPromises.promise;
                }
                else {
                }
                if (!this.useWebComponent) {
                    // case of no useWebComponent
                    const comment = document.createComment(`@@/${this.tagName}`);
                    this.pseudoParentNode = this.parentNode ?? utils.raise("parentNode is undefined");
                    this.pseudoNode = comment;
                    this.pseudoParentNode.replaceChild(comment, this);
                }
                // promises for alive
                this.alivePromises = Promise.withResolvers();
                await this.build();
            }
            finally {
                this.initialPromises?.resolve && this.initialPromises.resolve();
            }
        }
        async disconnectedCallback() {
            this.updator.addProcess(async () => {
                await this.states.current[DisconnectedCallbackSymbol]();
            }, undefined, [], undefined);
        }
    };
}

/**
 * コンポーネントをダイアログを簡単に表示できるように拡張する
 * 拡張内容は以下の通り
 * - dialogPromises: ダイアログ用Promise
 * - returnValue: 戻り値
 * - useBufferedBind: バッファードバインドを使用するかどうか
 * - asyncShowModal: モーダルダイアログ表示
 * - asyncShow: ダイアログ表示
 * - showModal: モーダルダイアログ表示
 * - show: ダイアログ表示
 * - close: ダイアログを閉じる
 * @param Base 元のコンポーネント
 * @returns {IDialogComponent} 拡張されたコンポーネント
 */
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
            return this.hasAttribute("buffered-bind");
        }
        constructor(...args) {
            super();
            this.addEventListener("closed", () => {
                if (typeof this.dialogPromises !== "undefined") {
                    if (this.returnValue === "") {
                        this.dialogPromises.reject();
                    }
                    else {
                        const buffer = this.props[GetBufferSymbol]();
                        this.props[ClearBufferSymbol]();
                        this.dialogPromises.resolve(buffer);
                    }
                    this.dialogPromises = undefined;
                }
                if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
                    if (this.returnValue !== "") {
                        this.props[FlushBufferSymbol]();
                    }
                }
            });
            this.addEventListener("close", () => {
                const closedEvent = new CustomEvent("closed");
                this.dispatchEvent(closedEvent);
            });
        }
        async #show(props, modal = true) {
            this.returnValue = "";
            this.dialogPromises = Promise.withResolvers();
            this.props[SetBufferSymbol](props);
            if (modal) {
                HTMLDialogElement.prototype.showModal.apply(this);
            }
            else {
                HTMLDialogElement.prototype.show.apply(this);
            }
            return this.dialogPromises.promise;
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
            if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
                this.returnValue = "";
                const buffer = this.props[CreateBufferSymbol]();
                this.props[SetBufferSymbol](buffer);
            }
            return HTMLDialogElement.prototype.showModal.apply(this);
        }
        show() {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: show is only for HTMLDialogElement");
            }
            if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
                this.returnValue = "";
                const buffer = this.props[CreateBufferSymbol]();
                this.props[SetBufferSymbol](buffer);
            }
            return HTMLDialogElement.prototype.show.apply(this);
        }
        close(returnValue = "") {
            if (!(this instanceof HTMLDialogElement)) {
                utils.raise("DialogComponent: close is only for HTMLDialogElement");
            }
            return HTMLDialogElement.prototype.close.apply(this, [returnValue]);
        }
    };
}

class PopoverButton {
    #targetId;
    #button;
    #bindings = new Set();
    get targetId() {
        return this.#targetId;
    }
    get button() {
        return this.#button;
    }
    get bindings() {
        return this.#bindings;
    }
    get target() {
        return document.getElementById(this.#targetId);
    }
    get loopContext() {
        return this.#bindings.values().next().value?.parentContentBindings.loopContext;
    }
    constructor(button) {
        this.#button = button;
        this.#targetId = button.getAttribute("popovertarget") ?? "";
    }
    addBinding(binding) {
        this.#bindings.add(binding);
    }
}
class PopoverInfo {
    #popoverButtonByButton = new Map();
    #currentButton;
    add(button) {
        const popoverButton = new PopoverButton(button);
        this.#popoverButtonByButton.set(button, popoverButton);
        return popoverButton;
    }
    addBinding(button, binding) {
        let popoverButton = this.#popoverButtonByButton.get(button);
        if (!popoverButton) {
            popoverButton = this.add(button);
        }
        popoverButton.addBinding(binding);
    }
    get(button) {
        return this.#popoverButtonByButton.get(button);
    }
    get currentButton() {
        return this.#currentButton;
    }
    set currentButton(value) {
        this.#currentButton = value;
    }
}
function createPopoverInfo() {
    return new PopoverInfo();
}

/**
 * コンポーネントをポップオーバーできるように拡張します
 * 拡張内容は以下の通り
 * - popoverPromises: ポップオーバー用Promise
 * - popoverLoopIndexesById: ポップオーバーループインデックス
 * - canceled: キャンセルフラグ
 * - asyncShowPopover: ポップオーバー表示
 * - hidePopover: ポップオーバーを閉じる
 * - cancelPopover: ポップオーバーをキャンセル
 *
 * @param Base 元のコンポーネント
 * @returns {IPopoverComponent} 拡張されたコンポーネント
 */
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
        #popoverLoopIndexesById;
        get popoverLoopIndexesById() {
            if (typeof this.#popoverLoopIndexesById === "undefined") {
                this.#popoverLoopIndexesById = new Map;
            }
            return this.#popoverLoopIndexesById;
        }
        #popoverInfo = createPopoverInfo();
        get popoverInfo() {
            return this.#popoverInfo;
        }
        constructor(...args) {
            super();
            this.addEventListener("hidden", () => {
                if (typeof this.popoverPromises !== "undefined") {
                    if (this.canceled) {
                        this.popoverPromises.reject();
                    }
                    else {
                        const buffer = this.props[GetBufferSymbol]();
                        this.props[ClearBufferSymbol]();
                        this.popoverPromises.resolve(buffer);
                    }
                    this.popoverPromises = undefined;
                }
                if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
                    if (!this.canceled) {
                        this.props[FlushBufferSymbol]();
                    }
                }
                this.canceled = true;
                // remove loop context
                const id = this.id;
                if (typeof id !== "undefined") {
                    this.popoverLoopIndexesById.delete(id);
                }
            });
            this.addEventListener("shown", () => {
                this.canceled = true;
                if (this.useBufferedBind && typeof this.parentComponent !== "undefined") {
                    const buffer = this.props[CreateBufferSymbol]();
                    this.props[SetBufferSymbol](buffer);
                }
                for (const key in this.props) {
                    this.states.current[NotifyForDependentPropsApiSymbol](key, undefined);
                }
            });
            this.addEventListener("toggle", (e) => {
                const toggleEvent = e;
                if (toggleEvent.newState === "closed") {
                    const hiddenEvent = new CustomEvent("hidden");
                    this.dispatchEvent(hiddenEvent);
                }
                else if (toggleEvent.newState === "open") {
                    const shownEvent = new CustomEvent("shown");
                    this.dispatchEvent(shownEvent);
                }
            });
        }
        async asyncShowPopover(props) {
            this.popoverPromises = Promise.withResolvers();
            this.props[SetBufferSymbol](props);
            HTMLElement.prototype.showPopover.apply(this);
            return this.popoverPromises.promise;
        }
        hidePopover() {
            this.canceled = false;
            HTMLElement.prototype.hidePopover.apply(this);
        }
        cancelPopover() {
            HTMLElement.prototype.hidePopover.apply(this);
        }
    };
}

/**
 * コンポーネントモジュールをカスタムエレメント名を指定してカスタムコンポーネントとして登録します
 * @param componentModules コンポーネントモジュールのオブジェクト、名前とモジュールのペア
 * @returns {void}
 */
function registerComponentModules(componentModules) {
    for (const [customElementName, userComponentModule] of Object.entries(componentModules)) {
        registerComponentModule(customElementName, userComponentModule);
    }
}

const customElementInfoByConstructor = new Map;
const filterManagersByConstructor = new Map;
/**
 * コンポーネントのベースとなるクラスを生成します
 * @param componentModule コンポーネントモジュール
 * @returns {typeof HTMLElement} コンポーネントクラス
 */
const generateComponentClass = (componentModule) => {
    const getBaseClass = function (module, baseConstructor) {
        const baseClass = class extends baseConstructor {
            #module = module;
            get module() {
                return this.#module;
            }
            get isQuelComponent() {
                return true;
            }
            #customElementInfo;
            get customElementInfo() {
                if (typeof this.#customElementInfo === "undefined") {
                    this.#customElementInfo = customElementInfoByConstructor.get(this.thisClass) ?? utils.raise(`customElementInfo is not found `);
                }
                return this.#customElementInfo;
            }
            #setCustomElementInfo() {
                const customeElementInfo = customElementInfoByConstructor.get(this.thisClass);
                if (typeof customeElementInfo === "undefined") {
                    const lowerTagName = this.tagName.toLowerCase();
                    const isAutonomousCustomElement = lowerTagName.includes("-");
                    const customName = this.getAttribute("is");
                    const isCostomizedBuiltInElement = customName ? true : false;
                    const selectorName = isAutonomousCustomElement ? lowerTagName : `${lowerTagName}[is="${customName}"]`;
                    customElementInfoByConstructor.set(this.thisClass, { selectorName, lowerTagName, isAutonomousCustomElement, isCostomizedBuiltInElement });
                }
            }
            get html() {
                return this.module.html;
            }
            set html(value) {
                this.module.html = value;
            }
            get template() {
                return this.module.template;
            }
            get css() {
                return this.module.css;
            }
            set css(value) {
                this.module.css = value;
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
                    this.#filterManagers = filterManagersByConstructor.get(this.thisClass) ?? utils.raise(`filterManagers is not found for ${this.tagName}`);
                }
                return this.#filterManagers;
            }
            #setFilterManagers() {
                const filterManagers = filterManagersByConstructor.get(this.thisClass);
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
                    filterManagersByConstructor.set(this.thisClass, filterManagers);
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
            get element() {
                return this;
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
            static thisClass;
            get thisClass() {
                return Reflect.get(this.constructor, "thisClass");
            }
            static _module = module;
            static get html() {
                return this._module.html;
            }
            static set html(value) {
                this._module.html = value;
            }
            static get css() {
                return this._module.css;
            }
            static set css(value) {
                this._module.css = value;
            }
        };
        baseClass.thisClass = baseClass;
        return baseClass;
    };
    const module = createModule(componentModule);
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
/**
 * コンポーネントモジュールをカスタムエレメント名を指定してカスタムコンポーネントとして登録します
 * @param customElementName カスタムエレメント名
 * @param componentModule コンポーネントモジュール
 * @returns {void}
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
/**
 * 単一ファイルコンポーネントをロードしコンポーネントモジュールを取得します
 * ファイルを読み込んで、テンプレート、スクリプト、スタイルを取得します
 * スクリプトはdata　uri schemeで読み込みます
 * なので、スクリプト内のimportは、絶対パス、importmap、エイリアスを使って記述してください
 * @param path 単一ファイルコンポーネントのパス
 * @returns {Promise<ComponentModule>} コンポーネントモジュール
 */
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

/**
 * 単一ファイルコンポーネントをカスタムエレメント名を指定して登録します
 * @param customElementName カスタムエレメント名
 * @param pathToSingleFileComponent 単一ファイルコンポーネントのパス
 * @returns {Promise<void>}
 */
async function registerSingleFileComponent(customElementName, pathToSingleFileComponent) {
    const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
    registerComponentModule(customElementName, componentModule);
}

/**
 * 単一ファイルコンポーネントをカスタムエレメント名を指定して登録します
 * @param pathToSingleFileComponentByCustomElementName 単一ファイルコンポーネントのパスのオブジェクト、カスタムエレメント名とパスのペア
 * @returns {Promise<void>}
 */
async function registerSingleFileComponents(pathToSingleFileComponentByCustomElementName) {
    for (const [customElementName, pathToSingleFileComponent] of Object.entries(pathToSingleFileComponentByCustomElementName ?? {})) {
        await registerSingleFileComponent(customElementName, pathToSingleFileComponent);
    }
}

/**
 * 単一ファイルコンポーネントからコンポーネントクラスを生成します
 * @param pathToSingleFileComponent 単一ファイルコンポーネントのパス
 * @returns {Promise<typeof HTMLElement>} コンポーネントクラス
 */
async function generateSingleFileComponentClass(pathToSingleFileComponent) {
    const componentModule = await loadSingleFileComponent(pathToSingleFileComponent);
    return generateComponentClass(componentModule);
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

export { bootFromImportMeta, config, generateComponentClass, generateSingleFileComponentClass, getCustomTagFromImportMeta, importCssFromImportMeta, importHtmlFromImportMeta, loadSingleFileComponent, loader, registerComponentModules, registerFilters, registerGlobal, registerSingleFileComponents };
