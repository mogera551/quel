import { loader } from "quel";

const DEFAULT_CONFIG_PATH = "./quel.config.json";
async function boot() {
  const url = new URL(import.meta.url);
  const path = url.searchParams.get("config");
  loader.configFile(path ?? DEFAULT_CONFIG_PATH).load();
}

await boot();
