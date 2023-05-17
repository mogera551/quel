import "../types.js";
import { View } from "../view/View.js";
import { createViewModel } from "../viewModel/Proxy.js";
import { Symbols } from "../Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { Binds } from "../bindInfo/Binds.js";
import { createProps } from "./Props.js";
import { createGlobals } from "./Globals.js";
import { Module } from "./Module.js";
import { Thread } from "../thread/Thread.js";
import { UpdateSlotStatus } from "../thread/UpdateSLotStatus.js";
import { UpdateSlot } from "../thread/UpdateSlot.js";

/**
 * 
 * @param {Node} node 
 * @returns {Component}
 */
const getParentComponent = (node) => {
  do {
    node = node.parentNode;
    if (node == null) return null;
    if (node[Symbols.isComponent]) return node;
    if (node instanceof ShadowRoot) {
      if (node.host[Symbols.isComponent]) return node.host;
      node = node.host;
    }
  } while(true);
};

export class Component extends HTMLElement {
  /**
   * @type {HTMLTemplateElement}
   * @static
   */
  static template;
  /**
   * @type {class<typeof ViewModel>}
   * @static
   */
  static ViewModel;
  /**
   * @type {boolean}
   */
  get [Symbols.isComponent] () {
    return true;
  }
  /**
   * @type {Proxy<ViewModel>}
   */
  viewModel;
  /**
   * @type {import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  _binds;
  get binds() {
    return this._binds;
  }
  /**
   * @type {Thread}
   */
  _thread;
  get thread() {
    return this._thread;
  }
  set thread(value) {
    this._thread = value;
  }
  /**
   * @type {UpdateSlot}
   */
  _updateSlot;
  get updateSlot() {
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, (updateSlotStatus) => {
        if (updateSlotStatus === UpdateSlotStatus.beginViewModelUpdate) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNotifyReceive) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNodeUpdate) {
          this.viewModel[Symbols.beCacheable]();
        }
      });
      this._thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  }
  /**
   * 単体テストのモック用
   */
  set updateSlot(value) {
    this._updateSlot = value;
  }
  /**
   * @type {Object<string,any>}
   */
  _props;
  get props() {
    return this._props;
  }
  /**
   * @type {Object<string,any>}
   */
  _globals;
  get globals() {
    return this._globals;
  }

  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    this._initialPromise = new Promise((resolve, reject) => {
      this._initialResolve = resolve;
      this._initialReject = reject;
    });
    this._props = createProps(this);
    this._globals = createGlobals();

  }

  /**
   * @type {string[]}
   */
//  static get observedAttributes() {
//    return [/* 変更を監視する属性名の配列 */];
//  }

  /**
   * shadowRootを使ってカプセル化をしない(true)
   * @type {boolean}
   */
  get noShadowRoot() {
    return this.hasAttribute("no-shadow-root");
  }

  /**
   * viewのルートとなる要素
   * @type {ShadowRoot|HTMLElement}
   */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  }

  async build() {
    const { template, ViewModel } = this.constructor; // staticから取得
    this.noShadowRoot || this.attachShadow({mode: 'open'});
    this._thread = new Thread;

    this.viewModel = createViewModel(this, ViewModel);
    await this.viewModel[Symbols.initCallback]();

    const initProc = async () => {
      this._binds = View.render(this.viewRootElement, this, template);
      return this.viewModel[Symbols.connectedCallback]();
    };
    const updateSlot = this.updateSlot;
    updateSlot.addProcess(new ProcessData(initProc, this, []));
    await updateSlot.alive();
  }

  /**
   * @type {Promise}
   */
  _initialPromise;
  /**
   * @type {() => {}}
   */
  _initialResolve;
  _initialReject;
  get initialPromise() {
    return this._initialPromise;
  }

  /**
   * @type {Promise}
   */
  _alivePromise;
  /**
   * @type {() => {}}
   */
  _aliveResolve;
  _aliveReject;
  get alivePromise() {
    return this._alivePromise;
  }

  /**
   * 親コンポーネント
   * @type {Component}
   */
  _parentComponent;
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  }

  /**
   * DOMツリーへ追加
   */
  async connectedCallback() {
    try {
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }
      this._alivePromise = new Promise((resolve, reject) => {
        this._aliveResolve = resolve;
        this._aliveReject = reject;
      });
      await this.build();
    } finally {
      this._initialResolve && this._initialResolve();
    }
  }

  /**
   * DOMツリーから削除
   */
  disconnectedCallback() {
    this._aliveResolve && this._aliveResolve(this.props[Symbols.toObject]());
  }

  /**
   * 移動時
   */
/*
  adoptedCallback() {
    
  }
*/

  /**
   * 属性値更新
   * @param {string} name 
   * @param {any} oldValue 
   * @param {any} newValue 
   */
/*
  attributeChangedCallback(name, oldValue, newValue) {
    
  }
*/

  /**
   * 
   * @param {Set<string>} setOfViewModelPropertyKeys 
   */
  applyToNode(setOfViewModelPropertyKeys) {
    this._binds && Binds.applyToNode(this._binds, setOfViewModelPropertyKeys);
  }

  /**
   * 
   * @param {UserComponentModule} componentModule 
   * @returns {class<HTMLElement>}
   */
  static getClass(componentModule) {
    const module = Object.assign(new Module, componentModule);
    // 同じクラスを登録できないため
    const componentClass = class extends Component {
      static template = module.template;
      static ViewModel = module.ViewModel;
    };
    return componentClass;
  }

}

/**
 * 
 * @param {UserComponentModule} componentModule 
 * @returns {class<HTMLElement>}
 */
export function generateComponentClass(componentModule) {
  return Component.getClass(componentModule);
}