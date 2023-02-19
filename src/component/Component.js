import "../types.js";
import utils from "../utils.js";
import ComponentData from "./Data.js";
import View from "../view/View.js";
import createViewModel from "../viewModel/Proxy.js";
import { SYM_CALL_INIT } from "../viewModel/Symbols.js";
import Thread from "../thread/Thread.js";
import { ProcessData } from "../thread/Processor.js";
import Binds from "../bind/Binds.js";

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node instanceof ShadowRoot) return node.host;
    if (node instanceof Component) return node;
  } while(true);
};

export default class Component extends HTMLElement {
  /**
   * @type {Proxy<ViewModel>}
   */
  viewModel;
  /**
   * @type {View}
   */
  view;
  /**
   * @type {Binds}
   */
  binds;

  constructor() {
    super();
    this.noShadowRoot || this.attachShadow({mode: 'open'});
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
    const componentData = Component.componentDataByName.get(this.tagName);
    componentData || utils.raise(`unknown tag name ${this.tagName}`);
    this.view = new View(componentData.template, this.viewRootElement);
    const viewModel = Reflect.construct(componentData.ViewModel, []);
    this.viewModel = createViewModel(this, viewModel);
    await this.viewModel[SYM_CALL_INIT]();

    Thread.current.addProcess(new ProcessData(() => {
      this.binds = this.view.render(this.viewModel);
    }, this, []))
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
//    console.log(`${this.tagName}.connectCallback()`);
    try {
      this.parentComponent && await this.parentComponent.initialPromise;
      await this.build();
    } finally {
      this.#initialResolve && this.#initialResolve();
    }
  }

  /**
   * DOMツリーから削除
   */
  disconnectedCallback() {
    
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
   * @param {integer[]} indexes 
   */
  notify(setOfKey) {
    this.binds.updateViewModel(setOfKey);
  }

  /**
   * @type {Map<string,ComponentData>}
   */
  static componentDataByName = new Map;
  
  /**
   * 
   * @param {string} name 
   * @param {UserComponentData} componentData 
   */
  static regist(name, componentData) {
    const upperName = name.toUpperCase();
    this.componentDataByName.set(upperName, Object.assign(new ComponentData(), componentData));
    const componentClass = class extends Component {}; // 同じクラスを登録できないため
    // nameにはハイフンが必要、アルファベットの大文字は使えません
    customElements.define(name, componentClass);

  }

}