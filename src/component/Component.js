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
import { AttachShadow } from "./AttachShadow.js";
import { inputFilters, outputFilters } from "../filter/Builtin.js";
import { utils } from "../utils.js";

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

const mixInComponent = {
  /**
   * @type {ViewModelProxy}
   */
  get viewModel() {
    return this._viewModel;
  },
  set viewModel(value) {
    this._viewModel = value;
  },
  /**
   * バインドリスト
   * @type {BindInfo[]}
   */
  get binds() {
    return this._binds;
  },
  set binds(value) {
    this._binds = value;
  },

  /**
   * 更新スレッド
   * @type {Thread}
   */
  get thread() {
    return this._thread;
  },
  set thread(value) {
    this._thread = value;
  },

  /**
   * 更新処理用スロット
   * @type {UpdateSlot}
   */
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
      this.thread.wakeup(this._updateSlot);
    }
    return this._updateSlot;
  },
  /**
   * 単体テストのモック用
   */
  set updateSlot(value) {
    this._updateSlot = value;
  },
  /**
   * @type {Object<string,any>}
   */
  get props() {
    return this._props;
  },
  /**
   * @type {Object<string,any>}
   */
  get globals() {
    return this._globals;
  },

  /**
   * @type {(...args) => {}}
   */
  get initialResolve() {
    return this._initialResolve;
  },
  set initialResolve(value) {
    this._initialResolve = value;
  },
  /**
   * @type {() => {}}
   */
  get initialReject() {
    return this._initialReject;
  },
  set initialReject(value) {
    this._initialReject = value;
  },
  /**
   * 初期化確認用プロミス
   * @type {Promise}
   */
  get initialPromise() {
    return this._initialPromise;
  },
  set initialPromise(value) {
    this._initialPromise = value;
  },

  /**
   * @type {(...args) => {}}
   */
  get aliveResolve() {
    return this._aliveResolve;
  },
  set aliveResolve(value) {
    this._aliveResolve = value;
  },
  /**
   * @type {() => {}}
   */
  get aliveReject() {
    return this._aliveReject;
  },
  set aliveReject(value) {
    this._aliveReject = value;
  },
  /**
   * 生存確認用プロミス
   * @type {Promise}
   */
  get alivePromise() {
    return this._alivePromise;
  },
  set alivePromise(value) {
    this._alivePromise = value;
  },

  /**
   * 親コンポーネント
   * @type {Component}
   */
  get parentComponent() {
    if (typeof this._parentComponent === "undefined") {
      this._parentComponent = getParentComponent(this);
    }
    return this._parentComponent;
  },

  /**
   * shadowRootを使ってカプセル化をする(true)
   * @type {boolean}
   */
  get withShadowRoot() {
    return this.hasAttribute("with-shadow-root");
  },

  /**
   * viewのルートとなる要素
   * @type {ShadowRoot|HTMLElement}
   */
  get viewRootElement() {
    return this.shadowRoot ?? this;
  },

  /**
   * @type {{in:Object<string,FilterFunc>,out:Object<string,FilterFunc>}}
   */
  get filters() {
    return this._filters;
  },

  /**
   * 
   */
  initialize() {
    this._viewModel = createViewModel(this, this.constructor.ViewModel);
    this._binds = undefined;
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
    this._filters = {
      in:Object.assign({}, inputFilters), 
      out:Object.assign({}, outputFilters),
    };

    this.initialPromise = new Promise((resolve, reject) => {
      this.initialResolve = resolve;
      this.initialReject = reject;
    });
  },

  /**
   * @type {string[]}
   */
//  static get observedAttributes() {
//    return [/* 変更を監視する属性名の配列 */];
//  }

  async build() {
    const { template, ViewModel, inputFilters, outputFilters } = this.constructor; // staticから取得
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
    if (AttachShadow.isAttachable(this.tagName.toLowerCase()) && this.withShadowRoot) {
      this.attachShadow({mode: 'open'});
    }
    this.thread = new Thread;

//    this.viewModel = createViewModel(this, ViewModel);
    await this.viewModel[Symbols.initCallback]();

    const initProc = async () => {
      this.binds = View.render(this.viewRootElement, this, template);
      return this.viewModel[Symbols.connectedCallback]();
    };
    const updateSlot = this.updateSlot;
    updateSlot.addProcess(new ProcessData(initProc, this, []));
    await updateSlot.alive();
  },

  /**
   * DOMツリーへ追加
   */
  async connectedCallback() {
    try {
      if (this.parentComponent) {
        await this.parentComponent.initialPromise;
      } else {
      }
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
   * DOMツリーから削除
   */
  disconnectedCallback() {
    this.aliveResolve && this.aliveResolve(this.props[Symbols.toObject]());
  },

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
    this.binds && Binds.applyToNode(this.binds, setOfViewModelPropertyKeys);
  },
}


export class ComponentClassGenerator {
  /**
   * 
   * @param {UserComponentModule} componentModule 
   * @returns {class<HTMLElement>}
   */
  static generate(componentModule) {
    const getBaseClass = function (module) {
      return class extends HTMLElement {
        /**
         * @type {HTMLTemplateElement}
         * @static
         */
        static template = module.template;
        /**
         * @type {class<typeof ViewModel>}
         * @static
         */
        static ViewModel = module.ViewModel;
        /**
         * @type {Object<string,FilterFunc>}
         */
        static inputFilters = module.inputFilters;
        /**
         * @type {Object<string,FilterFunc>}
         */
        static outputFilters = module.outputFilters;
        /**
         * @type {boolean}
         */
        get [Symbols.isComponent] () {
          return true;
        }
        /**
         * 
         */
        constructor() {
          super();
          this.initialize();
        }
        /**
         * 
         */
//        initialize() {
//        }
      };
    };
  
    const module = Object.assign(new Module, componentModule);
    // 同じクラスを登録できないため新しいクラスを生成する
    const componentClass = getBaseClass(module);
    if (typeof module.extendClass === "undefined" && typeof module.extendTag === "undefined") {
      // 自律型カスタム要素
    } else {
      // カスタマイズされた組み込み要素
      // extendsを書き換える
      // See http://var.blog.jp/archives/75174484.html
      const extendClass = module.extendClass ?? document.createElement(module.extendTag).constructor;
      componentClass.prototype.__proto__ = extendClass.prototype;
      componentClass.__proto__ = extendClass;
    }
  
    // mix in 
    for(let [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(mixInComponent))) {
      Object.defineProperty(componentClass.prototype, key, desc);
    }
    return componentClass;
  }
}
/**
 * 
 * @param {UserComponentModule} componentModule 
 * @returns {Component}
 */
export function generateComponentClass(componentModule) {
  return ComponentClassGenerator.generate(componentModule);
}