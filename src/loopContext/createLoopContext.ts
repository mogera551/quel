import { IBinding, IBindingTreeNode, IContentBindingsTreeNode } from "../binding/types";
import { getPatternInfo } from "../dotNotation/getPatternInfo";
import { utils } from "../utils";
import { createLoopIndexes } from "./createLoopIndexes";
import { ILoopContext, ILoopIndexes, INamedLoopContexts } from "./types";

class LoopContext implements ILoopContext{
  #revision?: number;
  #contentBindings: IContentBindingsTreeNode;
  #index?: number;
  #loopIndexes?: ILoopIndexes;
  #namedLoopIndexes?: ILoopIndexes;
  #namedLoopContexts?: INamedLoopContexts;
  #loopTreeNodesByName: {[key: string]: Set<IBinding>} = {};
  #loopTreeLoopableNodesByName: {[key: string]: Set<IBinding>} = {};
  constructor(
    contentBindings: IContentBindingsTreeNode
  ) {
    this.#contentBindings = contentBindings;
  }

  get contentBindings(): IContentBindingsTreeNode {
    return this.#contentBindings;
  }

  get patternName(): string {
    return this.contentBindings.patternName;
  }

  get parentPatternName(): string | undefined {
    const patternInfo = getPatternInfo(this.patternName);
    return patternInfo.wildcardPaths.at(-2);
  }

  get parentNamedLoopContext(): ILoopContext | undefined {
    // インデックスは変わるが親子関係は変わらないので、checkRevisionは不要
    const parentPatternName = this.parentPatternName;
    if (typeof parentPatternName !== "undefined") {
      return this.namedLoopContexts[parentPatternName];
    }
  }

  get parentLoopContext(): ILoopContext | undefined {
    let tmpContentBindings = this.contentBindings.parentBinding?.parentContentBindings;
    while(typeof tmpContentBindings !== "undefined") {
      if (typeof tmpContentBindings.loopContext !== "undefined" && tmpContentBindings.loopContext !== this) {
        return tmpContentBindings.loopContext;
      }
      tmpContentBindings = this.contentBindings.parentBinding?.parentContentBindings;
    }
  }

  get index(): number {
    this.checkRevision();
    if (typeof this.#index === "undefined") {
      this.#index = this.contentBindings.parentBinding?.childrenContentBindings.indexOf(this.contentBindings) ?? 
        utils.raise("index is undefined");
    }
    return this.#index;
  }

  // ToDo:名前が良くない
  get namedLoopIndexes(): ILoopIndexes {
    this.checkRevision();
    if (typeof this.#namedLoopIndexes === "undefined") {
      this.#namedLoopIndexes = (typeof this.parentNamedLoopContext === "undefined") ?
        createLoopIndexes(undefined, this.index) : this.parentNamedLoopContext.loopIndexes.add(this.index);
    }
    return this.#namedLoopIndexes;
  }

  get loopIndexes(): ILoopIndexes {
    this.checkRevision();
    if (typeof this.#loopIndexes === "undefined") {
      this.#loopIndexes = (typeof this.parentLoopContext === "undefined") ?
        createLoopIndexes(undefined, this.index) : this.parentLoopContext.loopIndexes.add(this.index);
    }
    return this.#loopIndexes;

  }

  get namedLoopContexts(): INamedLoopContexts {
    if (typeof this.#namedLoopContexts === "undefined") {
      this.#namedLoopContexts = 
        Object.assign(this.parentLoopContext?.namedLoopContexts ?? {}, {[this.patternName]: this});
    }
    return this.#namedLoopContexts;
  }

  // ルート検索用
  get loopTreeNodesByName(): {[key: string]: Set<IBinding>} {
    return this.#loopTreeNodesByName;
  }

  // ルート検索用
  get loopTreeLoopableNodesByName(): {[key: string]: Set<IBinding>} {
    return this.#loopTreeLoopableNodesByName;
  }
  
  checkRevision(): boolean {
    const revision = (this.contentBindings.parentBinding as IBinding)?.nodeProperty.revisionForLoop;
    if (typeof this.#revision === "undefined" || this.#revision !== revision) {
      this.#index = undefined;
      this.#loopIndexes = undefined;
      this.#namedLoopIndexes = undefined;
      this.#namedLoopContexts = undefined;
      return true;
    }
    return false;
  }

  dispose(): void {
    this.#index = undefined;
    this.#loopIndexes = undefined;
    this.#namedLoopIndexes = undefined;
    this.#namedLoopContexts = undefined;
  }
}

export function createLoopContext(contentBindings: IContentBindingsTreeNode): ILoopContext {
  return new LoopContext(contentBindings);
}