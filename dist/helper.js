/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {string}
 */
export function getCustomTagFromImportMeta(importMeta) {
  const url = new URL(importMeta.url);
  const tagName = url.search.slice(1);
  return tagName;
}

/**
 * 
 * @param {{url:string}} importMeta 
 * @returns {Promise<string>}
 */
export async function importHtmlFromImportMeta(importMeta) {
  return await fetch(importMeta.url.replace(".js", ".html")).then(response => response.text());
}