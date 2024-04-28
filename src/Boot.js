import { loader } from "./loader/QuelLoader.js";
import { config } from "./Config.js";

const DEFAULT_CONFIG_PATH = "./quel.config.json";

/**
 * 
 * @param {{url:string,resolve:(path:string)=>string}} importMeta 
 * @param {*} configPath 
 */
export async function bootFromImportMeta(importMeta, configPath) {
  const response = await fetch(importMeta.resolve(configPath ?? DEFAULT_CONFIG_PATH));
  const configData = await response.json();
  for(let [key, value] of Object.entries(config)) {
    config[key] = (typeof configData[key] !== "undefined") ? configData[key] : value;
  }
  await loader.config(configData).load();
}
