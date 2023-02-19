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

  removeFromParent() {
    this.childNodes.forEach(node => node.parentNode.removeChild(node));
  }

  expand() {
    this.binds.forEach(bind => {
      if (bind instanceof Template) {
        bind.expand();
      }
    })
  }

  changeIndex(index, diff) {
    this.binds.forEach(bind => bind.changeIndexes(index, diff));
  }
  /**
   * 
   * @param {Template} templateBind 
   * @param {integer} index 
   */
  static create(templateBind, index) {
    const {indexes, template, viewModel} = templateBind;
    const newIndexes = indexes.concat(index);
    const rootElement = document.importNode(template.content, true);
    const binds = Binder.bind(template, rootElement, viewModel, newIndexes);
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
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
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

  expand() {
    if (this.nodeProperty === "loop") {
      this.expandLoop();
    } else {
      this.expandIf();
    }
  }

  expandIf() {
    this.removeFromParent();
    this.templateChildren = BindToTemplate.expand(bind);
    this.appendToParent();
  }

  expandLoop() {
    //this.removeFromParent();

    const { viewModel, viewModelProperty, indexes, filters } = this;
    const lastValue = this.lastViewModelValue;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);

    const setOfLastValues = new Set(lastValue.values());
    const indexesByLastValue = new Map(Array.from(setOfLastValues).map(value => [ value, [] ]));
    lastValue.forEach((value, index) => indexesByLastValue.get(value).push(index));
    const lastIndexByNewIndex = new Map;
    const newTemplateChildren = value.map((value, index) => {
      const lastIndexes = indexesByLastValue.get(value) ?? [];
      if (lastIndexes.length === 0) {
        lastIndexByNewIndex.set(index, -1);
        return TemplateChild.create(this, index);
      } else {
        const lastIndex = parseInt(lastIndexes.shift());
        lastIndexByNewIndex.set(index, lastIndex);
        const templateChild = this.templateChildren[lastIndex];
        templateChild.changeIndex(indexes.length, index - lastIndex);
        return templateChild;
      }
    });
    Array.from(indexesByLastValue.values()).flatMap(indexes => indexes).forEach(deleteIndex => {
      this.templateChildren[deleteIndex].removeFromParent();
    });
    newTemplateChildren.forEach((templateChild, index) => {
      const prevLastIndex = lastIndexByNewIndex.get(index - 1);
      const lastIndex = lastIndexByNewIndex.get(index);
      if (typeof prevLastIndex !== "undefined" && (prevLastIndex + 1) === lastIndex) return;
      const prevChild = newTemplateChildren[index - 1];
      let prevNode = prevChild?.childNodes[prevChild.childNodes.length - 1] ?? this.template;
      templateChild.childNodes.forEach(node => {
        prevNode.after(node);
        prevNode = node;
      });
    })
    this.templateChildren = newTemplateChildren;

    this.templateChildren.forEach(templateChild => templateChild.expand());

    //this.appendToParent();
  }
  /**
   * 
   * @param {integer} index 
   * @param {integer} diff 
   */
  changeIndexes(index, diff) {
    this.indexes[index] = (parseInt(this.indexes[index]) + diff).toString();
    this.templateChildren.forEach(templateChild => {
      templateChild.binds.forEach(bind => bind.changeIndexes(index, diff));
    });
  }
}