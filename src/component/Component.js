import "../types.js";
import { Symbols } from "../Symbols.js";
import { Module } from "./Module.js";
import { mixInComponent } from "./MixInComponent.js";
import { utils } from "../utils.js";
import { config } from "../Config.js";

/**
 * コンポーネントクラスを生成するクラス
 * ※customElements.defineでタグに対して、ユニークなクラスを登録する必要があるため
 */
export class ComponentClassGenerator {
  
  /**
   * コンポーネントクラスを生成
   * @param {UserComponentModule} componentModule 
   * @returns {Component.constructor}
   */
  static generate(componentModule) {
    /** @type {(module:Module)=>HTMLElement.constructor} */
    const getBaseClass = function (module) {
      return class extends HTMLElement {

        /** @type {HTMLTemplateElement} */
        static template = module.template;

        /** @type {ViewModel.constructor} */
        static ViewModel = module.ViewModel;

        /**@type {Object<string,FilterFunc>} */
        static inputFilters = module.inputFilters;

        /** @type {Object<string,FilterFunc>} */
        static outputFilters = module.outputFilters;

        /** @type {boolean} */
        static useShadowRoot = module.useShadowRoot;

        /** @type {boolean} */
        static usePseudo = module.usePseudo;

        /** @type {boolean} */
        static useTagNamespace = module.useTagNamespace;

        /** @type {boolean} */
        static useKeyed = module.useKeyed ?? config.useKeyed;

        /** @type {boolean} */
        get [Symbols.isComponent] () {
          return true;
        }

        /**
         */
        constructor() {
          super();
          this.initialize();
        }
      };
    };
  
    /** @type {Module} */
    const module = Object.assign(new Module, componentModule);

    // カスタムコンポーネントには同一クラスを登録できないため新しいクラスを生成する
    const componentClass = getBaseClass(module);
    if (typeof module.extendClass === "undefined" && typeof module.extendTag === "undefined") {
      // 自律型カスタム要素
    } else {
      // カスタマイズされた組み込み要素
      // classのextendsを書き換える
      // See http://var.blog.jp/archives/75174484.html
      /** @type {HTMLElement.constructor} */
      const extendClass = module.extendClass ?? document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // 生成したコンポーネントクラスにComponentの機能を追加する（mix in） 
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }

    registComponentModules(module.componentModulesForRegist);
    return componentClass;
  }
}
/**
 * コンポーネントクラスを生成する
 * @param {UserComponentModule} componentModule 
 * @returns {Component.constructor}
 */
export function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}

/**
 * 
 * @param {string} customElementName 
 * @param {UserComponentModule} componentModule 
 */
export function registComponentModule(customElementName, componentModule) {
  const customElementKebabName = utils.toKebabCase(customElementName);
  const componentClass = ComponentClassGenerator.generate(componentModule);
  if (componentModule.extendTag) {
    customElements.define(customElementKebabName, componentClass, { extends:componentModule.extendTag });
  } else if (typeof componentModule?.extendClass === "undefined") {
    customElements.define(customElementKebabName, componentClass);
  } else {
    utils.raise("registComponentModule: extendTag should be set");
  }
}

/**
 * 
 * @param {Object<string,UserComponentModule>} componentModules 
 */
export function registComponentModules(componentModules) {
  for(const [customElementName, userComponentModule] of Object.entries(componentModules ?? {})) {
    registComponentModule(customElementName, userComponentModule);
  }
}