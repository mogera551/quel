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
import { createViewModels } from "../viewModel/Proxy.js";
import { Phase } from "../thread/Phase.js";
import { BindingSummary } from "../binding/BindingSummary.js";

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
      (this.updateSlot.phase !== Phase.gatherUpdatedProperties)) {
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

  /** @type {Resolvers} */
  get initialResolvers() {
    return this._initialResolvers;
  },
  set initialResolvers(value) {
    this._initialResolvers = value;
  },

  /** @type {Resolvers} */
  get aliveResolvers() {
    return this._aliveResolvers;
  },
  set aliveResolvers(value) {
    this._aliveResolvers = value;
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
  get useWebComponent() {
    return this._useWebComponent;
  },

  /** @type {boolean} タグネームスペースを使う */
  get useLocalTagName() {
    return this._useLocalTagName;
  },

  /** @type {boolean} keyedを使う */
  get useKeyed() {
    return this._useKeyed;
  },

  /** @type {ShadowRoot|HTMLElement} viewのルートとなる要素 */
  get viewRootElement() {
    return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode;
  },

  /** @type {Node} 親要素（useWebComponentがfalse以外では使わないこと） */
  get pseudoParentNode() {
    return !this.useWebComponent ? this._pseudoParentNode : utils.raise("mixInComponent: useWebComponent must be false");
  },

  /** @type {Node} 代替要素（useWebComponentがfalse以外では使わないこと） */
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
    this._initialResolvers = undefined;
    this._aliveResolvers = undefined;

    this._parentComponent = undefined;

    this._useShadowRoot = this.constructor.useShadowRoot;
    this._useWebComponent = this.constructor.useWebComponent;
    this._useLocalTagName = this.constructor.useLocalTagName;
    this._useKeyed = this.constructor.useKeyed;

    this._pseudoParentNode = undefined;
    this._pseudoNode = undefined;
    
    this._filters = {
      in: class extends inputFilters {},
      out: class extends outputFilters {},
    };

    this._bindingSummary = new BindingSummary;

    this.initialResolvers = Promise.withResolvers();
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
        if (name in this.filters.in) utils.raise(`mixInComponent: already exists filter ${name}`);
        this.filters.in[name] = filterFunc;
      }
    }
    if (typeof outputFilters !== "undefined") {
      for(const [name, filterFunc] of Object.entries(outputFilters)) {
        if (name in this.filters.out) utils.raise(`mixInComponent: already exists filter ${name}`);
        this.filters.out[name] = filterFunc;
      }
    }
    // シャドウルートの作成
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
      this.attachShadow({mode: 'open'});
    }
    // スレッドの生成
    this.thread = new Thread;

    // ViewModelの初期化処理（viewModelの$connectedCallbackを実行）
    await this.viewModel[Symbols.connectedCallback]();

    // Bindingツリーの構築
    this.rootBinding = BindingManager.create(this, template);
    this.bindingSummary.flush();

    if (!this.useWebComponent) {
      this.viewRootElement.insertBefore(this.rootBinding.fragment, this.pseudoNode.nextSibling)
      this.rootBinding.nodes.forEach(node => pseudoComponentByNode.set(node, this));
    } else {
      this.viewRootElement.appendChild(this.rootBinding.fragment);
    }

    if (this.updateSlot.isEmpty) {
      this.updateSlot.waitResolvers.resolve(true);
    }
    await this.updateSlot.aliveResolvers.promise;
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
        await this.parentComponent.initialResolvers.promise;
      } else {
      }

      if (!this.useWebComponent) {
        const comment = document.createComment(`@@/${this.tagName}`);
        this._pseudoParentNode = this.parentNode;
        this._pseudoNode = comment;
        this.pseudoParentNode.replaceChild(comment, this);
      }
      // 生存確認用プロミスの生成
      this.aliveResolvers = Promise.withResolvers();

      await this.build();
      
    } finally {
      this.initialResolvers?.resolve && this.initialResolvers.resolve();
    }
  },

  /**
   * DOMツリーから削除で呼ばれる
   * @returns {void}
   */
  disconnectedCallback() {
    this.aliveResolvers?.resolve && this.aliveResolvers.resolve(this.props[Symbols.toObject]());
  },

  /**
   * ノード更新処理
   * UpdateSlotのNodeUpdatorから呼び出される
   * @param {Map<string,PropertyAccess>} propertyAccessByViewModelPropertyKey 
   */
  updateNode(propertyAccessByViewModelPropertyKey) {
    this.rootBinding && BindingManager.updateNode(this.rootBinding, propertyAccessByViewModelPropertyKey);
  },
}
