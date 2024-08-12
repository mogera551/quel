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

export { config, getCustomTagFromImportMeta, importCssFromImportMeta, importHtmlFromImportMeta };
