import "../types.js";
import utils from "../utils.js"
import ComponentData from "./Data.js";
import View from "../view/View.js";

export default class Component extends HTMLElement {
  /**
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {View}
   */
  view;

  constructor() {
    super();
    const componentData = Component.componentDataByName.get(this.tagName);
    componentData || utils.raise(`unknown tag name ${this.tagName}`);
    this.noShadowRoot || this.attachShadow({mode: 'open'});
    this.view = new View(componentData.template, this.viewRootElement);
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

  /**
   * DOMツリーへ追加
   */
  connectedCallback() {
    this.view.render();
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