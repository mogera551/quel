import { loader, Main } from "quel";

const DEFAULT_CONFIG_PATH = "./quel.config.json";

/**
 * 
 * @param {string} path 
 * @returns {Object<string,any>}
 * @async
 */
async function readConfig(path) {
  const paths = location.pathname.split("/");
  paths[paths.length - 1] = path;
  const fullPath = location.origin + paths.join("/");

  const response = await fetch(fullPath);
  const json = await response.json();
  return json;
}

/**
 * @async
 */
async function boot() {
  const url = new URL(import.meta.url);
  const path = url.searchParams.get("config");
  const config = await readConfig(path ?? DEFAULT_CONFIG_PATH);
  Main.config(config);
  await loader.config(config).load();
}

await boot();
