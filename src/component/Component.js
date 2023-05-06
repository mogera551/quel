import "../types.js";
import { View } from "../view/View.js";
import { createViewModel } from "../newViewModel/Proxy.js";
import { Symbols } from "../newViewModel/Symbols.js";
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
    if (node instanceof Component) return node;
    if (node instanceof ShadowRoot) {
      if (node.host instanceof Component) return node.host;
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
   * @type {Proxy<ViewModel>}
   */
  viewModel;
  /**
   * @type {import("../bindInfo/BindInfo.js").BindInfo[]}
   */
  #binds;
  get binds() {
    return this.#binds;
  }
  /**
   * @type {Thread}
   */
  #thread;
  get thread() {
    return this.#thread;
  }
  set thread(value) {
    this.#thread = value;
  }
  /**
   * @type {UpdateSlot}
   */
  #updateSlot;
  get updateSlot() {
    if (typeof this.#updateSlot === "undefined") {
      this.#updateSlot = UpdateSlot.create(this, () => {
        this.#updateSlot = undefined;
      }, (updateSlotStatus) => {
        if (updateSlotStatus === UpdateSlotStatus.beginViewModelUpdate) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNotifyReceive) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNodeUpdate) {
          this.viewModel[Symbols.beCacheable]();
        }
      });
      this.#thread.wakeup(this.#updateSlot);
    }
    return this.#updateSlot;
  }
  /**
   * 単体テストのモック用
   */
  set updateSlot(value) {
    this.#updateSlot = value;
  }
  /**
   * @type {Object<string,any>}
   */
  #props = createProps(this);
  get props() {
    return this.#props;
  }
  /**
   * @type {Object<string,any>}
   */
  #globals = createGlobals();
  get globals() {
    return this.#globals;
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
    this.#thread = new Thread;

    this.viewModel = createViewModel(this, ViewModel);
    await this.viewModel[Symbols.initCallback]();

    const initProc = async () => {
      this.#binds = View.render(this.viewRootElement, this, template);
      return this.viewModel[Symbols.connectedCallback]();
    };
    const updateSlot = this.updateSlot;
    updateSlot.addProcess(new ProcessData(initProc, this, []));
    await updateSlot.alive();
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
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }
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
    this.#aliveResolve && this.#aliveResolve(this.props);
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
    this.#binds && Binds.applyToNode(this.#binds, setOfViewModelPropertyKeys);
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