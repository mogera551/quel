import { utils } from "../utils";
import { AsyncSetWritableSymbol, ConnectedCallbackSymbol, DisconnectedCallbackSymbol } from "../state/symbols";
import { isAttachableShadowRoot } from "./isAttachableShadowRoot";
import { getStyleSheetListByNames } from "./getStyleSheetListByNames";
import { localizeStyleSheet } from "./localizeStyleSheet";
import { createUpdator } from "../updator/Updator";
import { createProps } from "../props/createProps";
import { IComponent, ICustomComponent, Constructor, IComponentBase } from "./types";
import { IStateProxy } from "../state/types";
import { IContentBindings, INewBindingSummary } from "../binding/types";
import { createRootContentBindings } from "../binding/ContentBindings";
import { IUpdator } from "../updator/types";
import { getAdoptedCssNamesFromStyleValue } from "./getAdoptedCssNamesFromStyleValue";
import { createNewBindingSummary } from "../binding/createNewBindingSummary";
import { createNamedLoopIndexesFromAccessor } from "../loopContext/createNamedLoopIndexes";
import { IProps } from "../props/types";
import { createStateProxy } from "../state/createStateProxy";

const pseudoComponentByNode:Map<Node, IComponent> = new Map;

const getParentComponent = (_node:Node): IComponent|undefined => {
  let node:Node|null = _node;
  do {
    node = node.parentNode;
    if (node == null) return undefined;
    if (Reflect.get(node, "quelIsQuelComponent") === true) return node as IComponent;
    if (node instanceof ShadowRoot) {
      if (Reflect.get(node.host, "quelIsQuelComponent") === true) return node.host as IComponent;
      node = node.host;
    }
    const psuedoComponent = pseudoComponentByNode.get(node);
    if (typeof psuedoComponent !== "undefined") return psuedoComponent;
  } while(true);
};

// find parent shadow root for adoptedCSS 
function getParentShadowRoot(parentNode: Node | null): ShadowRoot|undefined{
  let node: Node | null = parentNode;
  while(node) {
    if (node instanceof ShadowRoot) {
      return node;
    }
    node = node.parentNode;
  }
}


const localStyleSheetByTagName:Map<string,CSSStyleSheet> = new Map;

/**
 * ToDo: quelAlivePromisesが必要かどうかを検討する
 */
/**
 * コンポーネントを拡張する
 * 拡張内容は以下の通り
 * - quelState: Stateの生成
 * - quelInitialPromises: 初期化用Promise
 * - quelAlivePromises: アライブ用Promise
 * - quelViewRootElement: 表示用ルート要素
 * - quelPseudoParentNode: 親ノード（use, case of useWebComponent is false）
 * - quelPseudoNode: ダミーノード（use, case of useWebComponent is false）
 * - quelBindingSummary: 新規バインディングサマリ
 * - quelUpdator: アップデータ
 * - quelProps: プロパティ
 * @param Base 元のコンポーネント
 * @returns {CustomComponent} 拡張されたコンポーネント
 */
export function CustomComponent<TBase extends Constructor<HTMLElement & IComponentBase>>(Base: TBase): Constructor<HTMLElement & IComponentBase & ICustomComponent> {
  return class extends Base implements ICustomComponent {
    constructor(...args:any[]) {
      super();
      this.#state = createStateProxy(this, Reflect.construct(this.quelStateClass, [])); // create state
      this.#quelBindingSummary = createNewBindingSummary();
      this.#initialPromises = Promise.withResolvers<void>(); // promises for initialize
      this.#updator = createUpdator(this);
      this.#props = createProps(this);
    }

    #parentComponent?:IComponent;
    get quelParentComponent(): IComponent | undefined {
      if (typeof this.#parentComponent === "undefined") {
        this.#parentComponent = getParentComponent(this);
      }
      return this.#parentComponent;
    }

    #initialPromises: PromiseWithResolvers<void>;
    get quelInitialPromises():PromiseWithResolvers<void> {
      return this.#initialPromises;
    }

    #alivePromises: PromiseWithResolvers<void>|undefined;
    get quelAlivePromises():PromiseWithResolvers<void> {
      return this.#alivePromises ?? utils.raise("quelAlivePromises is undefined");
    }
    set quelAlivePromises(promises:PromiseWithResolvers<void>) {
      this.#alivePromises = promises;
    }

    #state?: IStateProxy;
    get quelState(): IStateProxy {
      return this.#state ?? utils.raise("quelState is undefined");
    }

    #rootOfBindingTree?: IContentBindings;

    get quelViewRootElement():ShadowRoot|HTMLElement {
      return this.quelUseWebComponent ? (this.shadowRoot ?? this) : this.quelPseudoParentNode as HTMLElement;
    }

    // alias view root element */
    get quelQueryRoot():ShadowRoot|HTMLElement {
      return this.quelViewRootElement;
    }

    // parent node（use, case of useWebComponent is false）
    #pseudoParentNode?:Node;
    get quelPseudoParentNode():Node {
      return !this.quelUseWebComponent ? 
        (this.#pseudoParentNode ?? utils.raise("pseudoParentNode is undefined")) : 
        utils.raise("useWebComponent must be false");
    }

    // pseudo node（use, case of useWebComponent is false） */
    #pseudoNode?: Node;
    get quelPseudoNode(): Node {
      return !this.quelUseWebComponent ? 
        (this.#pseudoNode ?? utils.raise("pseudoNode is undefined")) :
        utils.raise("useWebComponent must be false");
    }

    #quelBindingSummary: INewBindingSummary;
    get quelBindingSummary(): INewBindingSummary {
      return this.#quelBindingSummary;
    }

    #updator: IUpdator;
    get quelUpdator(): IUpdator {
      return this.#updator;
    }

    #props: IProps;
    get quelProps(): IProps {
      return this.#props;
    }

    async #build() {
      if (isAttachableShadowRoot(this.tagName.toLowerCase()) && this.quelUseShadowRoot && this.quelUseWebComponent) {
        const shadowRoot = this.attachShadow({mode: 'open'});
        const names = getAdoptedCssNamesFromStyleValue(this);
        const styleSheets = getStyleSheetListByNames(names);
        if (typeof this.quelStyleSheet !== "undefined" ) {
          styleSheets.push(this.quelStyleSheet);
        }
        shadowRoot.adoptedStyleSheets = styleSheets;
      } else {
        if (typeof this.quelStyleSheet !== "undefined") {
          let adoptedStyleSheet = this.quelStyleSheet;
          if (this.quelUseLocalSelector) {
            const localStyleSheet = localStyleSheetByTagName.get(this.tagName);
            if (typeof localStyleSheet !== "undefined") {
              adoptedStyleSheet = localStyleSheet;
            } else {
              adoptedStyleSheet = localizeStyleSheet(this.quelStyleSheet, this.quelSelectorName);
              localStyleSheetByTagName.set(this.tagName, adoptedStyleSheet);
            }
          }
          const shadowRootOrDocument = getParentShadowRoot(this.parentNode) ?? document;
          const adoptedStyleSheets = shadowRootOrDocument.adoptedStyleSheets;
          if (!adoptedStyleSheets.includes(adoptedStyleSheet)) {
            shadowRootOrDocument.adoptedStyleSheets = adoptedStyleSheets.concat(adoptedStyleSheet);
          }
        }
      }
      if (this.quelUseOverscrollBehavior) {
        if (this.tagName === "DIALOG" || this.hasAttribute("popover")) {
          this.style.overscrollBehavior = "contain";
        }
      }

      await this.quelState[AsyncSetWritableSymbol](async () => {
        await this.quelState[ConnectedCallbackSymbol]();
      });

      // build binding tree and dom 
      const uuid = this.quelTemplate.dataset["uuid"] ?? utils.raise("uuid is undefined");
      const rootOfBindingTree = this.#rootOfBindingTree = createRootContentBindings(this as unknown as IComponent , uuid);
      this.quelUpdator.namedLoopIndexesStack.setNamedLoopIndexes(createNamedLoopIndexesFromAccessor(), () => {
        rootOfBindingTree.rebuild();
      });
      if (this.quelUseWebComponent) {
        // case of useWebComponent,
        // then append fragment block to quelViewRootElement
        this.quelViewRootElement.appendChild(rootOfBindingTree.fragment);
      } else {
        // case of no useWebComponent, 
        // then insert fragment block before pseudo node nextSibling
        this.quelViewRootElement.insertBefore(rootOfBindingTree.fragment, this.quelPseudoNode?.nextSibling ?? null);
        // child nodes add pseudoComponentByNode
        rootOfBindingTree.childNodes.forEach(node => pseudoComponentByNode.set(node, this as unknown as IComponent));
      }
    }

    async connectedCallback() {
      try {
        // wait for parent component initialize
        if (this.quelParentComponent) {
          await this.quelParentComponent.quelInitialPromises.promise;
        } else {
        }
  
        if (!this.quelUseWebComponent) {
          // case of no useWebComponent
          const comment = document.createComment(`@@/${this.tagName}`);
          const pseudoParentNode = this.#pseudoParentNode = this.parentNode ?? utils.raise("parentNode is undefined");
          this.#pseudoNode = comment;
          pseudoParentNode.replaceChild(comment, this);
        }
  
        // promises for alive
        this.#alivePromises = Promise.withResolvers<void>();
  
        await this.#build();
        
      } finally {
        this.quelInitialPromises?.resolve && this.quelInitialPromises.resolve();
      }
  
    }
    async disconnectedCallback() {
      this.quelUpdator.addProcess(async () => {
        await this.quelState[DisconnectedCallbackSymbol]();
      }, undefined, [], undefined);
    }
  };
}