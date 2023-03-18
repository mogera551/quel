import quel from "quel";

async function boot() {
  const url = new URL(import.meta.url);
  const path = url.searchParams.get("config");
  const paths = location.pathname.split("/");
  paths[paths.length - 1] = path;
  const fullPath = location.origin + paths.join("/");
  
  try {
    const response = await fetch(fullPath);
    const config = await response.json();
    quel.config(config).boot();
  } catch(e) {
    console.error(e);
  }
}

await boot();
