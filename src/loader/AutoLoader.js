import Component from "../component/Component.js";
import utils from "../utils.js";
import Prefix from "./Prefix.js";

/**
 * @enum {number}
 */
const NameType = {
  kebab:1,
  snake:2,
  upperCamel:3,
  lowerCamel:4,
}

const ReplaceNameType = {
  [NameType.kebab]: "{component-name}",
  [NameType.snake]: "{component_name}",
  [NameType.upperCamel]: "{ComponentName}",
  [NameType.lowerCamel]: "{componentName}",
}

const componentNames = (customName) => {
  const kebabName = customName;
  const snakeName = kebabName.replaceAll("-", "_");
  const upperCamelName = kebabName.split("-").map(text => text[0].toUpperCase() + text.slice(1)).join("");
  const lowerCamelName = upperCamelName[0].toLowerCase() + upperCamelName.slice(1);
  return {
    [NameType.kebab]: kebabName, 
    [NameType.snake]: snakeName, 
    [NameType.upperCamel]: upperCamelName, 
    [NameType.lowerCamel]: lowerCamelName
  }
}
export default class AutoLoader {
  static observe() {
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const callback = function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
              Array.from(mutation.addedNodes)
                .filter(node => (node instanceof HTMLElement) && 
                  node.tagName.includes("-") && 
                  typeof customElements.get(node.tagName.toLowerCase()) === "undefined")
                .forEach(element => AutoLoader.loadCustomTag(element.tagName.toLowerCase()));
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    Array.from(document.body.querySelectorAll("*"))
      .filter(element => element.tagName.includes("-") && 
        typeof customElements.get(element.tagName.toLowerCase()) === "undefined")
      .forEach(element => AutoLoader.loadCustomTag(element.tagName.toLowerCase()));
  }

  static async loadModule(tagName, path) {
    const componentModule = await import(/* webpackIgnore: true */path);
    Component.regist(tagName, componentModule.default);
  }

  static loadCustomTag(tagName) {
    const prefix = Prefix.getByTagName(tagName);
    
    if (prefix) {
      let path = prefix.path;
      const customName = tagName.slice(prefix.prefix.length + 1);
      const typedNames = componentNames(customName);
      for(let [nameType, typedName] of Object.entries(typedNames)) {
        const replace = ReplaceNameType[nameType];
        path = path.replaceAll(replace, typedName);
      }
      if (prefix.path === path) {
        path += (path.at(-1) !== "/" ? "/" : "") + typedNames[NameType.lowerCamel] + ".js";
      }
      const paths = location.pathname.split("/");
      paths[paths.length - 1] = path;
      const fullPath = location.origin + paths.join("/");
      this.loadModule(tagName, fullPath);

    }

  }


}