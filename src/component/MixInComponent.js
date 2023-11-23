import "../types.js";
import { Symbols } from "../Symbols.js";
import { createProps } from "./Props.js";
import { createGlobals } from "./Globals.js";
import { Thread } from "../thread/Thread.js";
import { UpdateSlot } from "../thread/UpdateSlot.js";
import { AttachShadow } from "./AttachShadow.js";
import { inputFilters, outputFilters } from "../filter/Builtin.js";
import { utils } from "../utils.js";
import { BindingManager } from "../binding/Binding.js";
import { Context } from "../context/Context.js";
import { createViewModels } from "../viewModel/Proxy.js";
import { Phase } from "../thread/Phase.js";
import { BindingSummary } from "../binding/BindingSummary.js";
import { Module } from "./Module.js";
import { Template } from "./Template.js";

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
export const mixInComponent = {
  /** @type {ViewModelProxy} */
  get viewModel() {
    if (typeof this.updateSlot === "undefined" || 
      (this.updateSlot.phase !== Phase.gatherUpdatedProperties && this.updateSlot.phase !== Phase.applyToNode)) {
      return this._viewModels["writable"];
    } else {
      return this._viewModels["readonly"];
    }
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
    if (typeof this._thread === "undefined") {
      return undefined;
    }
    if (typeof this._updateSlot === "undefined") {
      this._updateSlot = UpdateSlot.create(this, () => {
        this._updateSlot = undefined;
      }, phase => {
        if (phase === Phase.gatherUpdatedProperties) {
          this.viewModel[Symbols.clearCache]();
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

  /** @type {boolean} タグネームスペースを使う */
  get useTagNamesapce() {
    return this._useTagNamesapce;
  },

  /** @type {ShadowRoot|HTMLElement} viewのルートとなる要素 */
  get viewRootElement() {
    return this.usePseudo ? this.pseudoParentNode : (this.shadowRoot ?? this);
  },

  /** @type {Node} 親要素（usePseudo以外では使わないこと） */
  get pseudoParentNode() {
    return this.usePseudo ? this._pseudoParentNode : utils.raise("not usePseudo");
  },

  /** @type {Node} 代替要素（usePseudo以外では使わないこと） */
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
   * @type {BindingSummary}
   */
  get bindingSummary() {
    return this._bindingSummary;
  },

  /** 
   * 初期化
   * @returns {void}
   */
  initialize() {
    this._viewModels = createViewModels(this, this.constructor.ViewModel);
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
    this._useTagNamespace = this.constructor.useTagNamespace;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this._bindingSummary = new BindingSummary;

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
//    console.log(`components[${this.tagName}].build`);
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

    // Bindingツリーの構築
    this.rootBinding = BindingManager.create(this, template, Context.create());
    this.bindingSummary.flush();

    if (this.usePseudo) {
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling)
      this.rootBinding.nodes.forEach(node => pseudoComponentByNode.set(node, this));
    } else {
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    if (this.updateSlot.isEmpty) {
      this.updateSlot.waitResolve(true);
    }
    await this.updateSlot.alive();
  },

  /**
   * DOMツリーへ追加時呼ばれる
   * @returns {void}
   */
  async connectedCallback() {
//    console.log(`components[${this.tagName}].connectedCallback`);
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
