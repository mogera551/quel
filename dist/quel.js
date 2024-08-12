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
    return importMeta.url;
}
function importHtmlFromImportMeta(importMeta) {
    return importMeta.url;
}
function importCssFromImportMeta(importMeta) {
    return importMeta.url;
}
/*
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
*/

export { config, getCustomTagFromImportMeta, importCssFromImportMeta, importHtmlFromImportMeta };
