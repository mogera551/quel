import "../types.js";
import { createViewModel } from "../viewModel/Proxy.js";
import { Symbols } from "../Symbols.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { createProps } from "./Props.js";
import { createGlobals } from "./Globals.js";
import { Module } from "./Module.js";
import { Thread } from "../thread/Thread.js";
import { UpdateSlotStatus } from "../thread/UpdateSLotStatus.js";
import { UpdateSlot } from "../thread/UpdateSlot.js";
import { AttachShadow } from "./AttachShadow.js";
import { inputFilters, outputFilters } from "../filter/Builtin.js";
import { utils } from "../utils.js";
import { BindingManager } from "../binding/Binding.js";
import { Context } from "../context/Context.js";

/** @type {WeakMap<Node,Component>} */
const pseudoComponentByNode = new WeakMap;

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
    const component = pseudoComponentByNode.get(node);
    if (typeof component !== "undefined") return component;
  } while(true);
};

/** @type {ComponentBase} */
const mixInComponent = {
  /** @type {ViewModelProxy} */
  get viewModel() {
    return this._viewModel;
  },
  set viewModel(value) {
    this._viewModel = value;
  },

  /** @type {BindingManager} */
  get rootBinding() {
    return this._rootBinding;
  },
  set rootBinding(value) {
    this._rootBinding = value;
  },

  /** @type {Thread} 更新スレッド */
  get thread() {
    return this._thread;
  },
  set thread(value) {
    this._thread = value;
  },

  /** @type {UpdateSlot} 更新処理用スロット */
  get updateSlot() {
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, (updateSlotStatus) => {
        if (updateSlotStatus === UpdateSlotStatus.beginViewModelUpdate) {
          this.viewModel[Symbols.beUncacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNotifyReceive) {
          this.viewModel[Symbols.beCacheable]();
        } else if (updateSlotStatus === UpdateSlotStatus.beginNodeUpdate) {
          this.viewModel[Symbols.beCacheable]();
        }
      });
      this.thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  },
  // 単体テストのモック用
  set updateSlot(value) {
    this._updateSlot = value;
  },

  /** @type {Object<string,any>} */
  get props() {
    return this._props;
  },

  /** @type {Object<string,any>} */
  get globals() {
    return this._globals;
  },

  /** @type {(...args) => void} */
  get initialResolve() {
    return this._initialResolve;
  },
  set initialResolve(value) {
    this._initialResolve = value;
  },

  /** @type {() => void} */
  get initialReject() {
    return this._initialReject;
  },
  set initialReject(value) {
    this._initialReject = value;
  },

  /** @type {Promise} 初期化確認用プロミス */
  get initialPromise() {
    return this._initialPromise;
  },
  set initialPromise(value) {
    this._initialPromise = value;
  },

  /** @type {(...args) => void} */
  get aliveResolve() {
    return this._aliveResolve;
  },
  set aliveResolve(value) {
    this._aliveResolve = value;
  },

  /** @type {() => void} */
  get aliveReject() {
    return this._aliveReject;
  },
  set aliveReject(value) {
    this._aliveReject = value;
  },

  /** @type {Promise} 生存確認用プロミス */
  get alivePromise() {
    return this._alivePromise;
  },
  set alivePromise(value) {
    this._alivePromise = value;
  },

  /** @type {Component} 親コンポーネント */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  },

  /** @type {boolean} shadowRootを使ってカプセル化をする(true) */
  get useShadowRoot() {
    return this._useShadowRoot;
  },

  /** @type {boolean} 仮想コンポーネントを使う */
  get usePseudo() {
    return this._usePseudo;
  },

  /** @type {ShadowRoot|HTMLElement} viewのルートとなる要素 */
  get viewRootElement() {
    return this.usePseudo ? this.pseudoParentNode : (this.shadowRoot ?? this);
  },

  /** @type {Node} 親要素（usePseudo以外では使わないこと） */
  get pseudoParentNode() {
    return this.usePseudo ? this._pseudoParentNode : utils.raise("not usePseudo");
  },

  /** @type {Node} 代替要素 */
  get pseudoNode() {
    return this._pseudoNode;
  },

  /**
   * @type {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}}
   */
  get filters() {
    return this._filters;
  },

  /** 
   * 初期化
   * @returns {void}
   */
  initialize() {
    this._viewModel = createViewModel(this, this.constructor.ViewModel);
    this._rootBinding = undefined;
    this._thread = undefined;
    this._updateSlot = undefined;
    this._props = createProps(this);
    this._globals = createGlobals();
    this._initialPromise = undefined;
    this._initialResolve = undefined;
    this._initialReject = undefined;

    this._alivePromise = undefined;
    this._aliveResolve = undefined;
    this._aliveReject = undefined;

    this._parentComponent = undefined;

    this._useShadowRoot = this.constructor.useShadowRoot;
    this._usePseudo = this.constructor.usePseudo;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this.initialPromise = new Promise((resolve, reject) => {
      this.initialResolve = resolve;
      this.initialReject = reject;
    });
  },

  /**
   * コンポーネント構築処理（connectedCallbackで呼ばれる）
   * @returns {void}
   */
  async build() {
    const { template, inputFilters, outputFilters } = this.constructor; // staticから取得
    // フィルターの設定
    if (typeof inputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(inputFilters)) {
        if (name in this.filters.in) utils.raise(`already exists filter ${name}`);
        this.filters.in[name] = filterFunc;
      }
    }
    if (typeof outputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(outputFilters)) {
        if (name in this.filters.out) utils.raise(`already exists filter ${name}`);
        this.filters.out[name] = filterFunc;
      }
    }
    // シャドウルートの作成
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && !this.usePseudo) {
      this.attachShadow({mode: 'open'});
    }
    // スレッドの生成
    this.thread = new Thread;

    // ViewModelの初期化処理（viewModelの$connectedCallbackを実行）
    await this.viewModel[Symbols.connectedCallback]();

    this.viewModel[Symbols.beCacheable]();

    // Bindingツリーの構築
    this.rootBinding = BindingManager.create(this, template, Context.create());
    if (this.usePseudo) {
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling)
    } else {
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    await this.updateSlot.alive();
  },

  /**
   * DOMツリーへ追加時呼ばれる
   * @returns {void}
   */
  async connectedCallback() {
    try {
      // 親要素の初期化処理の終了を待つ
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }

      if (this.usePseudo) {
        const comment = document.createComment(`@@/${this.tagName}`);
        this._pseudoParentNode = this.parentNode;
        this._pseudoNode = comment;
        this.pseudoParentNode.replaceChild(comment, this);
      }
      // 生存確認用プロミスの生成
      this.alivePromise = new Promise((resolve, reject) => {
        this.aliveResolve = resolve;
        this.aliveReject = reject;
      });

      await this.build();
      
    } finally {
      this.initialResolve && this.initialResolve();
    }
  },

  /**
   * DOMツリーから削除で呼ばれる
   * @returns {void}
   */
  disconnectedCallback() {
    this.aliveResolve && this.aliveResolve(this.props[Symbols.toObject]());
  },

  /**
   * ノード更新処理
   * UpdateSlotのNotifyReceiverから呼び出される
   * @param {Set<string>} setOfViewModelPropertyKeys 
   */
  updateNode(setOfViewModelPropertyKeys) {
    this.rootBinding?.updateNode(setOfViewModelPropertyKeys);
  },
}

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