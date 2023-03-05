import Binder from "../bind/Binder.js";
import BindToTemplate from "../bind/BindToTemplate.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET } from "../viewModel/Symbols.js";
import BindInfo from "./BindInfo.js";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLTemplateElement}
 */
const toHTMLTemplateElement = node => (node instanceof HTMLTemplateElement) ? node : utils.raise("not HTMLTemplateElement");

export class TemplateChild {
  /**
   * @type {BindInfo[]}
   */
  binds;
  /**
   * @type {Node[]}
   */
  childNodes;
  /**
   * @type {DocumentFragment}
   */
  fragment;
  /**
   * @type {Node}
   */
  get lastNode() {
    return this.childNodes[this.childNodes.length - 1];
  }
  /**
   * @type {node[]|DocumentFragment}
   */
  get nodesForAppend() {
    return this.fragment.childNodes.length > 0 ? [this.fragment] : this.childNodes;
  }
  /**
   * @type {Set<Node>}
   */
  get setOfNodes() {
    return new Set(this.childNodes);
  }

  /**
   * 
   */
  removeFromParent() {
    this.childNodes.forEach(node => node.parentNode?.removeChild(node));
    this.binds.forEach(bind => bind.removeFromParent());
  }

  /**
   * 
   */
  updateNode() {
    this.binds.forEach(bind => {
      bind.updateNode();
    })
  }

  /**
   * 
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndex(index, diff) {
    this.binds.forEach(bind => bind.changeIndexes(index, diff));
  }

  /**
   * 
   * @param {Template} templateBind 
   * @param {number[]} indexes 
   * @returns {TemplateChild}
   */
  static create(templateBind, indexes) {
    const {component, template} = templateBind;
    const rootElement = document.importNode(template.content, true);
    const binds = Binder.bind(template, rootElement, component, indexes);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes, fragment:rootElement });
  }
}

export default class Template extends BindInfo {
  get node() {
    return super.node;
  }
  set node(node) {
    const template = toHTMLTemplateElement(node);
    const comment = document.createComment(`template ${template.dataset["bind"]}`);
    template.parentNode.replaceChild(comment, template);
    super.node = comment;
    this.template = template;
  }
  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];
  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    return this.#template;
  }
  set template(value) {
    this.#template = value;
  }

  updateNode() {
    const newValue = (this.nodeProperty === "loop") ? this.expandLoop() : this.expandIf();
    this.lastViewModelValue = (newValue instanceof Array) ? newValue.slice() : newValue;
  }
  
  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.forEach(child => child.removeFromParent());
/*
    const nodes = this.templateChildren.flatMap(child => child.childNodes);
    if (nodes.length > 0) {
      const oldParentNode = nodes[0].parentNode;
      const newParentNode = oldParentNode.cloneNode(false);
      oldParentNode.parentNode.replaceChild(newParentNode, oldParentNode)
      nodes.forEach(node => node.parentNode.removeChild(node));
      newParentNode.parentNode.replaceChild(oldParentNode, newParentNode);
    }
*/
  }

  /**
   * 
   */
  appendToParent() {
    const fragment = document.createDocumentFragment();
    this.templateChildren
      .forEach(child => fragment.appendChild(...child.nodesForAppend));
    this.node.after(fragment);
  }

  /**
   * 
   * @returns {any} newValue
   */
  expandIf() {
    const { viewModel, viewModelProperty, indexes, filters } = this;
    /**
     * @type {any}
     */
    const lastValue = this.lastViewModelValue;
    /**
     * @type {any}
     */
    const newValue = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (lastValue === newValue) return newValue;
    this.removeFromParent();
    if (newValue) {
      this.templateChildren = [TemplateChild.create(this, indexes)];
      this.appendToParent();
    } else {
      this.templateChildren = [];
    }
    return newValue;
  }

  /**
   * @returns {any[]} newValue
   */
  expandLoop() {
    const { viewModel, viewModelProperty, indexes, filters } = this;
    /**
     * @type {any[]}
     */
    const lastValue = this.lastViewModelValue ?? [];
    /**
     * @type {any[]}
     */
    const newValue = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters) ?? [];

    /**
     * @type {Map<any,number[]>}
     */
    const indexesByLastValue = lastValue.reduce((map, value, index) => {
      map.get(value)?.push(index) ?? map.set(value, [ index ]);
      return map;
    }, new Map);
    /**
     * @type {Map<number,number>}
     */
    const lastIndexByNewIndex = new Map;
    const moveOrCreateIndexes = [];
    // 新しくテンプレート子要素のリストを作成する
    /**
     * @type {TemplateChild[]}
     */
    const newTemplateChildren = newValue.map((value, newIndex) => {
      const lastIndexes = indexesByLastValue.get(value);
      if (typeof lastIndexes === "undefined") {
        // 元のインデックスがない場合、新規
        lastIndexByNewIndex.set(newIndex, undefined);
        moveOrCreateIndexes.push(newIndex);
        return TemplateChild.create(this, indexes.concat(newIndex));
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = this.templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndex(indexes.length, newIndex - lastIndex);
        const prevLastIndex = lastIndexByNewIndex.get(newIndex - 1);
        if (typeof prevLastIndex === "undefined" || prevLastIndex > lastIndex) {
          moveOrCreateIndexes.push(newIndex);
        }
        return templateChild;
      }
    });
    // 削除対象、追加・移動対象のインデックスを取得
    for(const indexes of indexesByLastValue.values()) {
      for(const index of indexes) {
        this.templateChildren[index].removeFromParent();
      }
    }

    moveOrCreateIndexes.forEach(moveOrCreateIndex => {
      const templateChild = newTemplateChildren[moveOrCreateIndex];
      const beforeNode = newTemplateChildren[moveOrCreateIndex - 1]?.lastNode ?? this.node;
      beforeNode.after(...templateChild.nodesForAppend);
    });

    // 子要素の展開を実行
    newTemplateChildren.forEach(templateChild => templateChild.updateNode());

    this.templateChildren = newTemplateChildren;

    return newValue;
  }

  /**
   * 
   * @param {number} index 
   * @param {number} diff 
   */
  changeIndexes(index, diff) {
    this.indexes[index] = this.indexes[index] + diff;
    this.templateChildren.forEach(templateChild => templateChild.changeIndex(index, diff));
  }
}