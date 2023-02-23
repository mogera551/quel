import Binder from "../bind/Binder.js";
import BindToTemplate from "../bind/BindToTemplate.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET } from "../viewModel/Symbols.js";
import BindInfo from "./BindInfo.js";

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
   * @type {Node}
   */
  get lastNode() {
    return this.childNodes[this.childNodes.length - 1];
  }

  /**
   * 
   */
  removeFromParent() {
    this.childNodes.forEach(node => node.parentNode.removeChild(node));
  }

  /**
   * 
   */
  expand() {
    this.binds.forEach(bind => {
      if (bind instanceof Template) {
        bind.expand();
      }
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
   */
  static create(templateBind, indexes) {
    const {component, template} = templateBind;
    const rootElement = document.importNode(template.content, true);
    const binds = Binder.bind(template, rootElement, component, indexes);
    const childNodes = Array.from(rootElement.childNodes);
    return Object.assign(new TemplateChild, { binds, childNodes });
  }
}

export default class Template extends BindInfo {
  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];
  /**
   * @type {HTMLTemplateElement}
   */
  get template() {
    return (this.node instanceof HTMLTemplateElement) ? this.node : utils.raise("not HTMLTemplateElement");
  }

  updateNode() {
    // 値だけ更新
    const {viewModel, viewModelProperty, indexes, filters} = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    if (this.nodeProperty === "loop") {
      this.lastViewModelValue = (value ?? []).slice();
    } else {
      this.lastViewModelValue = value;
    }
  }
  
  /**
   * 
   */
  removeFromParent() {
    const nodes = this.templateChildren.flatMap(child => child.childNodes);
    if (nodes.length > 0) {
      const oldParentNode = nodes[0].parentNode;
      const newParentNode = oldParentNode.cloneNode(false);
      oldParentNode.parentNode.replaceChild(newParentNode, oldParentNode)
      nodes.forEach(node => node.parentNode.removeChild(node));
      newParentNode.parentNode.replaceChild(oldParentNode, newParentNode);
    }
  }

  /**
   * 
   */
  appendToParent() {
    const fragment = document.createDocumentFragment();
    this.templateChildren
      .flatMap(child => child.childNodes)
      .forEach(node => fragment.appendChild(node));
    this.template.after(fragment);
  }

  /**
   * 
   */
  expand() {
    if (this.nodeProperty === "loop") {
      this.expandLoop();
    } else {
      this.expandIf();
    }
  }

  /**
   * 
   * @returns 
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
    if (lastValue === newValue) return;
    this.removeFromParent();
    this.templateChildren = [TemplateChild.create(this, indexes)];
    this.appendToParent();
  }

  /**
   * 
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
    // 新しくテンプレート子要素のリストを作成する
    const newTemplateChildren = newValue.map((value, newIndex) => {
      const lastIndexes = indexesByLastValue.get(value);
      if (typeof lastIndexes === "undefined") {
        // 元のインデックスがない場合、新規
        lastIndexByNewIndex.set(newIndex, undefined);
        return TemplateChild.create(this, indexes.concat(newIndex));
      } else {
        // 元のインデックスがある場合、子要素のループインデックスを書き換え
        // indexesByLastValueから、インデックスを削除、最終的に残ったものが削除する子要素
        const lastIndex = lastIndexes.shift();
        lastIndexByNewIndex.set(newIndex, lastIndex);
        const templateChild = this.templateChildren[lastIndex];
        (newIndex !== lastIndex) && templateChild.changeIndex(indexes.length, newIndex - lastIndex);
        return templateChild;
      }
    });
    // 既存の子要素が新しいテンプレート子要素にない、子要素のノードを削除
    Array.from(indexesByLastValue.values()).flatMap(indexes => indexes).forEach(deleteIndex => {
      this.templateChildren[deleteIndex].removeFromParent();
    });

    // 並び順が違っていたら子要素のノードを移動させる
    newTemplateChildren.reduce(([prevChild, prevLastIndex], templateChild, index) => {
      const lastIndex = lastIndexByNewIndex.get(index);
      if (typeof prevLastIndex === "undefined" || typeof lastIndex === "undefined" || prevLastIndex > lastIndex) {
        (prevChild?.lastNode ?? this.template).after(...templateChild.childNodes);
      }
      return [templateChild, lastIndex];
    }, [undefined, undefined]);

    // 子要素の展開を実行
    newTemplateChildren.forEach(templateChild => templateChild.expand());
    this.templateChildren = newTemplateChildren;
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