import { utils } from "../utils";
import { ConnectedCallbackSymbol, DisconnectedCallbackSymbol } from "../state/symbols";
import { isAttachableShadowRoot } from "./isAttachableShadowRoot";
import { getStyleSheetListByNames } from "./getStyleSheetListByNames";
import { localizeStyleSheet } from "./localizeStyleSheet";
import { createUpdator } from "../updator/Updator";
import { createProps } from "./createProps";
import { createGlobals } from "./createGlobals";
import { IComponent, ICustomComponent, IProps, Constructor, IComponentBase } from "./types";
import { IStates } from "../state/types";
import { IContentBindings, INewBindingSummary } from "../binding/types";
import { IGlobalDataProxy } from "../global/types";
import { createRootContentBindings } from "../binding/ContentBindings";
import { createStates } from "../state/createStates";
import { IUpdator } from "../updator/types";
import { getAdoptedCssNamesFromStyleValue } from "./getAdoptedCssNamesFromStyleValue";
import { createNewBindingSummary } from "../binding/createNewBindingSummary";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";

const pseudoComponentByNode:Map<Node, IComponent> = new Map;

const getParentComponent = (_node:Node): IComponent|undefined => {
  let node:Node|null = _node;
  do {
    node = node.parentNode;
    if (node == null) return undefined;
    if (Reflect.get(node, "isQuelComponent") === true) return node as IComponent;
    if (node instanceof ShadowRoot) {
      if (Reflect.get(node.host, "isQuelComponent") === true) return node.host as IComponent;
      node = node.host;
    }
    const psuedoComponent = pseudoComponentByNode.get(node);
    if (typeof psuedoComponent !== "undefined") return psuedoComponent;
  } while(true);
};

const localStyleSheetByTagName:Map<string,CSSStyleSheet> = new Map;

/**
 * コンポーネントを拡張する
 * 拡張内容は以下の通り
 * - states: Stateの生成
 * - initialPromises: 初期化用Promise
 * - alivePromises: アライブ用Promise
 * - rootBindingManager: ルートバインディングマネージャ
 * - viewRootElement: 表示用ルート要素
 * - pseudoParentNode: 親ノード（use, case of useWebComponent is false）
 * - pseudoNode: ダミーノード（use, case of useWebComponent is false）
 * - newBindingSummary: 新規バインディングサマリ
 * - updator: アップデータ
 * - props: プロパティ
 * - globals: グローバルデータ
 * @param Base 元のコンポーネント
 * @returns {CustomComponent} 拡張されたコンポーネント
 */
export function CustomComponent<TBase extends Constructor<HTMLElement & IComponentBase>>(Base: TBase): Constructor<HTMLElement & IComponentBase & ICustomComponent> {
  return class extends Base implements ICustomComponent {
    constructor(...args:any[]) {
      super();
      this.#states = createStates(this, Reflect.construct(this.State, [])); // create state
      this.#newBindingSummary = createNewBindingSummary();
      this.#initialPromises = Promise.withResolvers<void>(); // promises for initialize
      this.#updator = createUpdator(this);
      this.#props = createProps(this);
      this.#globals = createGlobals(this);  
    }

    get component():IComponent {
      return this as unknown as IComponent;
    }
    #parentComponent?:IComponent;
    get parentComponent(): IComponent | undefined {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this);
      }
      return this.#parentComponent;
    }

    #initialPromises: PromiseWithResolvers<void>;
    get initialPromises():PromiseWithResolvers<void> {
      return this.#initialPromises;
    }

    #alivePromises: PromiseWithResolvers<void>|undefined;
    get alivePromises():PromiseWithResolvers<void> {
      return this.#alivePromises ?? utils.raise("alivePromises is undefined");
    }
    set alivePromises(promises:PromiseWithResolvers<void>) {
      this.#alivePromises = promises;
    }

    #states: IStates;
    get states(): IStates {
      return this.#states;
    }

    #rootBindingManager?: IContentBindings;
    get rootBindingManager(): IContentBindings {
      return this.#rootBindingManager ?? utils.raise("rootBindingManager is undefined");
    }
    set rootBindingManager(bindingManager: IContentBindings) {
      this.#rootBindingManager = bindingManager;
    }

    get viewRootElement():ShadowRoot|HTMLElement {
      return this.useWebComponent ? (this.shadowRoot ?? this) : this.pseudoParentNode as HTMLElement;
    }

    // alias view root element */
    get queryRoot():ShadowRoot|HTMLElement {
      return this.viewRootElement;
    }

    // parent node（use, case of useWebComponent is false）
    #pseudoParentNode:Node|undefined;
    get pseudoParentNode():Node {
      return !this.useWebComponent ? 
        (this.#pseudoParentNode ?? utils.raise("pseudoParentNode is undefined")) : 
        utils.raise("mixInComponent: useWebComponent must be false");
    }
    set pseudoParentNode(node:Node) {
      this.#pseudoParentNode = node;
    }

    // pseudo node（use, case of useWebComponent is false） */
    #pseudoNode?: Node;
    get pseudoNode(): Node {
      return this.#pseudoNode ?? utils.raise("pseudoNode is undefined");
    }
    set pseudoNode(node:Node) {
      this.#pseudoNode = node;
    }

    // find parent shadow root, or document, for adoptedCSS 
    get shadowRootOrDocument(): ShadowRoot|Document {
      let node = this.parentNode;
      while(node) {
        if (node instanceof ShadowRoot) {
          return node;
        }
        node = node.parentNode;
      }
      return document;
    }

    #newBindingSummary: INewBindingSummary;
    get newBindingSummary(): INewBindingSummary {
      return this.#newBindingSummary;
    }

    #updator: IUpdator;
    get updator(): IUpdator {
      return this.#updator;
    }

    #props: IProps;
    get props(): IProps {
      return this.#props;
    }

    #globals: IGlobalDataProxy;
    get globals(): IGlobalDataProxy {
      return this.#globals;
    }
  
    async build() {
      if (isAttachableShadowRoot(this.tagName.toLowerCase()) && this.useShadowRoot && this.useWebComponent) {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const names = getAdoptedCssNamesFromStyleValue(this);
        const styleSheets = getStyleSheetListByNames(names);
        if (typeof this.styleSheet !== "undefined" ) {
          styleSheets.push(this.styleSheet);
        }
        shadowRoot.adoptedStyleSheets = styleSheets;
      } else {
        if (typeof this.styleSheet !== "undefined") {
          let adoptedStyleSheet = this.styleSheet;
          if (this.useLocalSelector) {
            const localStyleSheet = localStyleSheetByTagName.get(this.tagName);
            if (typeof localStyleSheet !== "undefined") {
              adoptedStyleSheet = localStyleSheet;
            } else {
              adoptedStyleSheet = localizeStyleSheet(this.styleSheet, this.selectorName);
              localStyleSheetByTagName.set(this.tagName, adoptedStyleSheet);
            }
          }
          const shadowRootOrDocument = this.shadowRootOrDocument;
          const adoptedStyleSheets = shadowRootOrDocument.adoptedStyleSheets;
          if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
            shadowRootOrDocument.adoptedStyleSheets = adoptedStyleSheets.concat(adoptedStyleSheet);
          }
        }
      }
      if (this.useOverscrollBehavior) {
        if (this.tagName === "DIALOG" || this.hasAttribute("popover")) {
          this.style.overscrollBehavior = "contain";
        }
      }

      await this.states.asyncSetWritable(async () => {
        await this.states.current[ConnectedCallbackSymbol]();
      });

      // build binding tree and dom 
      const uuid = this.template.dataset["uuid"] ?? utils.raise("uuid is undefined");
      this.rootBindingManager = createRootContentBindings(this as unknown as IComponent , uuid);
      this.updator.namedLoopIndexesStack.setNamedLoopIndexes(createNamedLoopIndexesFromAccessor(), () => {
        this.rootBindingManager.rebuild();
      });
      if (this.useWebComponent) {
        // case of useWebComponent,
        // then append fragment block to viewRootElement
        this.viewRootElement.appendChild(this.rootBindingManager.fragment);
      } else {
        // case of no useWebComponent, 
        // then insert fragment block before pseudo node nextSibling
        this.viewRootElement.insertBefore(this.rootBindingManager.fragment, this.pseudoNode?.nextSibling ?? null);
        // child nodes add pseudoComponentByNode
        this.rootBindingManager.childNodes.forEach(node => pseudoComponentByNode.set(node, this as unknown as IComponent));
      }
    }

    async connectedCallback() {
      try {
        // wait for parent component initialize
        if (this.parentComponent) {
          await this.parentComponent.initialPromises.promise;
        } else {
        }
  
        if (!this.useWebComponent) {
          // case of no useWebComponent
          const comment = document.createComment(`@@/${this.tagName}`);
          this.pseudoParentNode = this.parentNode ?? utils.raise("parentNode is undefined");
          this.pseudoNode = comment;
          this.pseudoParentNode.replaceChild(comment, this);
        }
  
        // promises for alive
        this.alivePromises = Promise.withResolvers<void>();
  
        await this.build();
        
      } finally {
        this.initialPromises?.resolve && this.initialPromises.resolve();
      }
  
    }
    async disconnectedCallback() {
      this.updator.addProcess(async () => {
        await this.states.current[DisconnectedCallbackSymbol]();
      }, undefined, [], undefined);
    }
  };
}