import { loader } from "./loader/QuelLoader";
import { config } from "./Config";
import { ImportMeta_ } from "./@types/importMeta";

const DEFAULT_CONFIG_PATH = "./quel.config.json";

export async function bootFromImportMeta(importMeta:ImportMeta_, configPath:string|undefined) {
  const response = await fetch(importMeta.resolve(configPath ?? DEFAULT_CONFIG_PATH));
  const configData = await response.json();
  for(let [key, value] of Object.entries(config)) {
    config[key as keyof typeof config] = (typeof configData[key] !== "undefined") ? configData[key] : value;
  }
  await loader.config(configData).load();
}
