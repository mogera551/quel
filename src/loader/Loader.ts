import { Config } from "./Config";
import { Prefix } from "./Prefix";
import { Registrar } from "./types";
import { getPathInfo } from "./getPathInfo";
import { toKebabCase } from "./toKebabCase";
import { utils } from "../utils";

export class Loader {
  #configFile:string|undefined;
  #config:Config;
  #prefixMap:Map<string,Prefix> = new Map;
  #registrar:Registrar;

  /**
   * @type {string}
   */
  #location;

  /**
   * 
   * @param {RegistrarClass} registrar 
   */
  constructor(registrar:Registrar) {
    this.#registrar = registrar;
    this.#location = window.location;
    this.#config = Object.assign(new Config);
  }

  /**
   * configの設定
   */
  setConfig(config:Config) {
    this.#config = Object.assign(new Config, config);
    if ("prefixMap" in config && typeof config.prefixMap !== "undefined") {
      this.setPrefixMap(config.prefixMap);
    }
  }

  /**
   * configの取得
   */
  getConfig():Config {
    return this.#config;
  }

  /**
   * prefixMapの設定
   */
  setPrefixMap(prefixMap:{[key:string]:string}) {
    this.#prefixMap = new Map(Object.entries(prefixMap).map(
      ([prefix, path]) => {
        const kebabPrefix = toKebabCase(prefix) as string;
        return [kebabPrefix, new Prefix(prefix, path)];
      }
    ));
  }

  /**
   * prefixMapの取得
   */
  getPrefixMap():Map<string,Prefix> {
    return this.#prefixMap;
  }

  /**
   * configファイルの設定
   * メソッドチェーン
   * @param {string} configFile 
   * @returns {Loader}
   */
  configFile(configFile:string):Loader {
    this.#configFile = configFile;
    return this;
  }

  /**
   * configの設定
   * メソッドチェーン
   */
  config(config:Config):Loader {
    this.setConfig(config);
    return this;
  }

  /**
   * prefixMapの設定
   * メソッドチェーン
   */
  prefixMap(prefixMap:{[key:string]:string}):Loader {
    this.setPrefixMap(prefixMap);
    return this;
  }

  get registrar():Registrar {
    return this.#registrar;
  }

  /**
   * 
   */
  async loadConfig(configFile:string):Promise<Config> {
    // コンフィグをファイルから読み込む
    const paths = this.#location.pathname.split("/");
    paths[paths.length - 1] = configFile;
    const fullPath = this.#location.origin + paths.join("/");

    try {
      const response = await fetch(fullPath);
      const config = await response.json();
      return Object.assign(new Config, config);
    } catch(e) {
      console.error(`config file load error (configFile:${configFile}, ${fullPath})`, e);
      throw new Error("config file load error");
    }
  }

  async load(...loadNames:string[]):Promise<Loader> {
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
    const modules = [];
    for(let loadName of loadNames) {
      loadName = toKebabCase(loadName) as string;
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
      } catch(e) {
        console.error(`import error (loadName:${loadName}, ${importPath})`, e);
        throw new Error("import error");
      }
      let moduleData;
      if (typeof loadPaths.exportName !== "undefined") {
        if (typeof module.default !== "undefined") {
          if (loadPaths.exportName in module.default) {
            moduleData = module.default[loadPaths.exportName];
          }
        } else {
          if (loadPaths.exportName in module) {
            moduleData = module[loadPaths.exportName];
          }
        }
        if (typeof moduleData === "undefined" ) {
          throw new Error(`${loadPaths.exportName} not found in module (exportName:${loadPaths.exportName}, ${loadPaths.filePath})`);
        }
      } else {
        if (typeof module.default !== "undefined") {
          moduleData = module.default;
        } else {
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
  static create(registrar:Registrar):Loader {
    return new Loader(registrar);
  }

}

