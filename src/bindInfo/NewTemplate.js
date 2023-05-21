import "../types.js";
import { utils } from "../utils.js";
import { Filter } from "../filter/Filter.js";
import { BindInfo } from "./BindInfo.js";
import { Binder } from "../binder/Binder.js";
import { Selector } from "../binder/Selector.js";
import { TEMPLATE_BRANCH, TEMPLATE_REPEAT } from "../Const.js";
import { Context } from "../context/Context.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../view/Templates.js";

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
   * @type {ContextInfo}
   */
  context;
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
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
    const changedParam = this.context.stack.find(param => param.propName.name === propName.name);
    if (changedParam) {
      this.context.indexes[changedParam.pos] += diff;
      const paramPos = changedParam.indexes.length - 1;
      changedParam.indexes[paramPos] += diff;
      this.context.stack.filter(param => param.propName.setOfParentPaths.has(propName.name)).forEach(param => {
        param.indexes[paramPos] += diff;
      });
    }
    this.binds.forEach(bind => bind.changeIndexes(propName, diff));
  }

  /**
   * 
   * @param {Template} templateBind 
   * @param {ContextInfo} context
   * @returns {TemplateChild}
   */
  static create(templateBind, context) {
    const {component, template} = templateBind;
    const rootElement = document.importNode(template.content, true);
    const nodes = Selector.getTargetNodes(template, rootElement);
    const binds = Binder.bind(nodes, component, context);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes, fragment:rootElement, context });
  }
}

export class NewTemplateBind extends BindInfo {
  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];
  /**
   * @type {HTMLTemplateElement}
   */
  #template;
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Templates.templateByUUID.get(this.uuid);
    }
    return this.#template;
  }
  /**
   * @type {string}
   */
  #uuid;
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = this.node.textContent.slice(3);
    }
    return this.#uuid;
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
    const { filters, context } = this;
    const lastValue = this.lastViewModelValue;
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters);
    if (lastValue !== newValue) {
      this.removeFromParent();
      if (newValue) {
        this.templateChildren = [TemplateChild.create(this, context)];
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
    const { filters, templateChildren, context } = this;
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

    // コンテキスト用のデータ
    const pos = context.indexes.length;
    const propName = this.viewModelPropertyName;
    const parentIndexes = this.contextParam?.indexes ?? [];

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
        const newContext = Context.clone(context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos})
        return TemplateChild.create(this, newContext);
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndexes(this.viewModelPropertyName, newIndex - lastIndex);
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
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
    super.changeIndexes(propName, diff);
    this.templateChildren.forEach(templateChild => templateChild.changeIndexes(propName, diff));
  }
}