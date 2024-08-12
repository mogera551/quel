
export function getCustomTagFromImportMeta(importMeta:ImportMeta):string {
  const url = new URL(importMeta.url);
  const tagName = url.search.slice(1);
  return tagName;
}

export async function importHtmlFromImportMeta(importMeta:ImportMeta):Promise<string> {
  return await fetch(importMeta.url.replace(".js", ".html")).then(response => response.text());
}

export async function importCssFromImportMeta(importMeta:ImportMeta):Promise<string> {
  return await fetch(importMeta.url.replace(".js", ".css")).then(response => response.text());
}
