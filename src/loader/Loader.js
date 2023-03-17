import Component from "../component/Component.js";
import utils from "../utils.js";
import ComponentNameTypeUtil, { ComponentNameType } from "./ComponentNameType.js";

const ComponentFileFormat = {
  component:0,
  quel:1,
}

export default class {
  static replaceNames = ComponentNameTypeUtil.getNames("component-name")
  /**
   * 
   * @param {string} tagName 
   * @param {Object<string,string>} customTagPrefix
   * @param {ComponentNameType} defaultComponentNameType 
   * @param {string} defaultComponentPath 
   */
  static async load(tagName, customTagPrefix, defaultComponentNameType, defaultComponentPath) {
    const { replaceNames } = this;
    const componentFileFormat = tagName[0] === "@" ? ComponentFileFormat.quel : ComponentFileFormat.component;
    const rawTagName = tagName[0] === "@" ? tagName.slice(1) : tagName;
    const registTagName = utils.toKebabCase(rawTagName);
    // タグに一致するプレフィックスを取得する
    const prefixInfo = 
      Object.entries(customTagPrefix)
        .map(([prefix, path]) => ({prefix, path}))
        .find(({prefix, path}) => rawTagName.startsWith(prefix + "-"));
    // プレフィックスがある場合、プレフィックスを除いた部分をコンポーネント名とする
    const componentName = prefixInfo ? registTagName.slice(prefixInfo.prefix.length + 1) : registTagName;
    // タイプ別（スネーク、ケバブ、キャメル）のコンポーネント名を取得する
    const componentNames = ComponentNameTypeUtil.getNames(componentName);
    const prefixPath = prefixInfo?.path ?? defaultComponentPath;
    // パスのパターンをコンポーネント名でリプレース
    let path = prefixPath;
    for(let nameType of Object.values(ComponentNameType)) {
      path = path.replaceAll(`{${replaceNames[nameType]}}`, componentNames[nameType]);
    }
    // リプレースが発生しなければ、デフォルトの方法として、パスの後ろにコンポーネント名.jsを付加する
    if (path === prefixPath) {
      path += ((path.at(-1) !== "/") ? "/" : "") + componentNames[defaultComponentNameType] + ".js";
    }
    // http://～を先方に付加して相対パスを解決する
    const paths = location.pathname.split("/");
    paths[paths.length - 1] = path;
    const fullPath = location.origin + paths.join("/");
    try {
      const componentModule = await import(/* webpackIgnore: true */fullPath);
      if (componentFileFormat === ComponentFileFormat.component) {
        customElements.define(registTagName, componentModule.default);
      } else if (componentFileFormat === ComponentFileFormat.quel) {
        Component.regist(registTagName, componentModule.default);
      } else {
      }
    } catch(e) {
      console.log(`can't load component { registTagName:${registTagName}, fullPath:${fullPath} }`);
      console.error(e);
    }

  }
}