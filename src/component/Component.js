import "../types.js";
import View from "../view/View.js";
import createViewModel from "../viewModel/Proxy.js";
import { SYM_CALL_INIT } from "../viewModel/Symbols.js";
import Thread, { UpdateSlot } from "../thread/Thread.js";
import { ProcessData } from "../thread/Processor.js";
import Binds from "../bind/Binds.js";
import createData from "./Data.js"

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node instanceof Component) return node;
    if (node instanceof ShadowRoot) {
      if (node.host instanceof Component) return node.host;
      node = node.host;
    }
  } while(true);
};

/**
 * HTMLの変換
 * {{loop:}}{{if:}}を<template>へ置換
 * {{end:}}を</template>へ置換
 * {{...}}を<!--@@...-->へ置換
 * @param {string} html 
 * @returns {string}
 */
const replaceTag = (html) => {
  const stack = [];
  return html.replaceAll(/\{\{([^\}]+)\}\}/g, (match, expr) => {
    expr = expr.trim();
    if (expr.startsWith("loop:") || expr.startsWith("if:")) {
      stack.push(expr);
      return `<template data-bind="${expr}">`;
    } else if (expr.startsWith("else:")){
      const saveExpr = stack.at(-1);
      return `</template><template data-bind="${saveExpr}|not">`;
    } else if (expr.startsWith("end:")){
      stack.pop();
      return `</template>`;
    } else {
      return `<!--@@${expr}-->`;
    }
  });
}

/**
 * @param {string?} html
 * @param {string?} css
 * @returns {HTMLTemplateElement}
 */
const htmlToTemplate = (html, css) => {
  const template = document.createElement("template");
  template.innerHTML = (css ? `<style>\n${css}\n</style>` : "") + (html ? replaceTag(html) : "");
  return template;
}

export default class Component extends HTMLElement {
  /**
   * @type {string}
   * @static
   */
  static html;
  /**
   * @type {HTMLTemplateElement}
   */
  static template;
  /**
   * @type {class}
   * @static
   */
  static ViewModel;
  /**
   * @type {Proxy<ViewModel>}
   */
  viewModel;
  /**
   * @type {View}
   */
  #view;
  /**
   * @type {Binds}
   */
  #binds;
  /**
   * @type {Thread}
   */
  #thread;
  /**
   * @type {UpdateSlot}
   */
  #updateSlot;
  get updateSlot() {
    if (typeof this.#updateSlot === "undefined") {
      this.#updateSlot = UpdateSlot.create(() => {
        this.#updateSlot = undefined;
      });
      this.#thread.wakeup(this.#updateSlot);
    }
    return this.#updateSlot;
  }
  /**
   * @type {Object<string,any>}
   */
  #data = createData(this);
  get data() {
    return this.#data;
  }

  constructor() {
    super();
    this.#initialPromise = new Promise((resolve, reject) => {
      this.#initialResolve = resolve;
      this.#initialReject = reject;
    });
  }

  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return [/* 変更を監視する属性名の配列 */];
  }
  
  /**
   * shadowRootを使ってカプセル化をしない(true)
   * @type {boolean}
   */
  get noShadowRoot() {
    return this.hasAttribute("no-shadow-root");
  }

  /**
   * viewのルートとなる要素
   * @type {HTMLElement}
   */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  }

  async build() {
    const { template, ViewModel } = this.constructor;
    this.noShadowRoot || this.attachShadow({mode: 'open'});
    this.#thread = new Thread;

    this.#view = new View(template, this.viewRootElement);
    const viewModel = Reflect.construct(ViewModel, []);
    this.viewModel = createViewModel(this, viewModel);
    await this.viewModel[SYM_CALL_INIT]();

    this.updateSlot.addProcess(new ProcessData(() => {
      this.#binds = this.#view.render(this);
    }, this, []));
  }

  /**
   * @type {Promise}
   */
  #initialPromise;
  /**
   * @type {() => {}}
   */
  #initialResolve;
  #initialReject;
  get initialPromise() {
    return this.#initialPromise;
  }

  /**
   * @type {Promise}
   */
  #alivePromise;
  /**
   * @type {() => {}}
   */
  #aliveResolve;
  #aliveReject;
  get alivePromise() {
    return this.#alivePromise;
  }

  /**
   * 親コンポーネント
   * @type {Component}
   */
  #parentComponent;
  get parentComponent() {
    if (typeof this.#parentComponent === "undefined") {
      this.#parentComponent = getParentComponent(this);
    }
    return this.#parentComponent;
  }

  /**
   * DOMツリーへ追加
   */
  async connectedCallback() {
    try {
      this.parentComponent && await this.parentComponent.initialPromise;
      this.#alivePromise = new Promise((resolve, reject) => {
        this.#aliveResolve = resolve;
        this.#aliveReject = reject;
      });
      await this.build();
    } finally {
      this.#initialResolve && this.#initialResolve();
    }
  }

  /**
   * DOMツリーから削除
   */
  disconnectedCallback() {
    this.#aliveResolve && this.#aliveResolve(this.data);
  }

  /**
   * 移動時
   */
  adoptedCallback() {
    
  }

  /**
   * 属性値更新
   * @param {string} name 
   * @param {any} oldValue 
   * @param {any} newValue 
   */
  attributeChangedCallback(name, oldValue, newValue) {
    
  }

  /**
   * 
   * @param {Set<string>} setOfKey 
   * @param {number[]} indexes 
   */
  notify(setOfKey) {
    this.#binds?.updateViewModel(setOfKey);
  }

  /**
   * 
   * @param {string} name 
   * @param {UserComponentData} componentData 
   */
  static regist(name, componentData) {
    const template = htmlToTemplate(componentData.html, componentData.css);
    // 同じクラスを登録できないため
    const componentClass = class extends Component {
      static template = template;
      static ViewModel = componentData.ViewModel;
    };
    // nameにはハイフンが必要、アルファベットの大文字は使えません
    customElements.define(name, componentClass);
  }

}