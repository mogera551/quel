import "../types.js";
import  { utils } from "../utils.js";
import { Filter } from "../filter/Filter.js";
import { BindInfo } from "./BindInfo.js";
import { Binder } from "../binder/Binder.js";
import { Selector } from "../binder/Selector.js";
import { TEMPLATE_BRANCH, TEMPLATE_REPEAT } from "../Const.js";

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
   * @param {BindInfo} target 
   * @param {number} diff 
   */
  changeIndexes(target, diff) {
    this.binds.forEach(bind => bind.changeIndexes(target, diff));
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
    const nodes = Selector.getTargetNodes(template, rootElement);
    const binds = Binder.bind(nodes, component, templateBind, indexes);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes, fragment:rootElement });
  }
}

export class Template extends BindInfo {
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
  get nodeProperty() {
    return super.nodeProperty;
  }
  set nodeProperty(value) {
    super.nodeProperty = value;
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
    const newValue = (this.nodeProperty === TEMPLATE_REPEAT) ? this.expandLoop() : 
      (this.nodeProperty === TEMPLATE_BRANCH) ? this.expandIf() : utils.raise(`unknown property ${this.nodeProperty}`);
    this.lastViewModelValue = (newValue instanceof Array) ? newValue.slice() : newValue;
  }
  
  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.forEach(child => child.removeFromParent());
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
    const { contextIndexes, filters } = this;
    const lastValue = this.lastViewModelValue;
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (lastValue !== newValue) {
      this.removeFromParent();
      if (newValue) {
        this.templateChildren = [TemplateChild.create(this, contextIndexes)];
        this.appendToParent();
      } else {
        this.templateChildren = [];
      }
    }

    // 子要素の展開を実行
    this.templateChildren.forEach(templateChild => templateChild.updateNode());

    return newValue;
  }

  /**
   * @returns {any[]} newValue
   */
  expandLoop() {
    const { contextIndexes, filters, templateChildren } = this;
    /**
     * @type {any[]}
     */
    const lastValue = this.lastViewModelValue ?? [];
    /**
     * @type {any[]}
     */
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters) ?? [];

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
      if (typeof lastIndexes === "undefined" || lastIndexes.length === 0) {
        // 元のインデックスがない場合、新規
        lastIndexByNewIndex.set(newIndex, undefined);
        moveOrCreateIndexes.push(newIndex);
        return TemplateChild.create(this, contextIndexes.concat(newIndex));
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndexes(this, newIndex - lastIndex);
        const prevLastIndex = lastIndexByNewIndex.get(newIndex - 1);
        if (typeof prevLastIndex === "undefined" || prevLastIndex > lastIndex) {
          moveOrCreateIndexes.push(newIndex);
        }
        return templateChild;
      }
    });
    // 削除対象、追加・移動対象のインデックスを取得し、ノードを削除
    for(const indexes of indexesByLastValue.values()) {
      for(const index of indexes) {
        templateChildren[index].removeFromParent();
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
   * @param {BindInfo} target 
   * @param {number} diff 
   */
  changeIndexes(target, diff) {
    super.changeIndexes(target, diff);
    this.templateChildren.forEach(templateChild => templateChild.changeIndexes(target, diff));
  }
}