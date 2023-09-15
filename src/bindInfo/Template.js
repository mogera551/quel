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
import { ViewTemplate } from "../view/View.js";

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
   * @type {string}
   */
  uuid;

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
//    this.childNodes.forEach(node => node.parentNode?.removeChild(node));
    this.childNodes.forEach(node => this.fragment.appendChild(node));
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
   * @param {TemplateBind} templateBind 
   * @param {ContextInfo} context
   * @returns {TemplateChild}
   */
  static create(templateBind, context) {
    const { component, template, uuid } = templateBind;
    const templateChildren = this.templateChildrenByUUID.get(uuid)
    if (typeof templateChildren === "undefined" || templateChildren.length === 0) {
      const { binds, content } = ViewTemplate.render(component, template, context);
      const childNodes = Array.from(content.childNodes);
      return Object.assign(new TemplateChild, { binds, childNodes, fragment:content, context, uuid });
    } else {
      const templateChild = templateChildren.pop();
      templateChild.binds.forEach(bind => {
        bind.context = context;
        bind.updateNode();
      });
      return templateChild;
    }
  }

  /**
   * @type {Map<string,TemplateChild[]>}
   */
  static templateChildrenByUUID = new Map;
  static dispose(templateChild) {
    const children = this.templateChildrenByUUID.get(templateChild.uuid);
    if (typeof children === "undefined") {
      this.templateChildrenByUUID.set(templateChild.uuid, [templateChild]);
    } else {
      children.push(templateChild);
    }
  }
}

export class TemplateBind extends BindInfo {
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
    (this.nodeProperty === TEMPLATE_REPEAT) ? this.expandLoop() : 
      (this.nodeProperty === TEMPLATE_BRANCH) ? this.expandIf() : utils.raise(`unknown property ${this.nodeProperty}`);
  }
  
  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.forEach(child => {
      child.removeFromParent();
      TemplateChild.dispose(child);
    });
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
    const { component, filters, context } = this;
    const value = this.getViewModelValue();
    if (this.lastViewModelValue !== value) {
      const filteredValue = Filter.applyForOutput(value, filters, component.filters.out);
      if (this.lastViewModelFilteredValue !== filteredValue) {
        this.removeFromParent();
        if (filteredValue) {
          this.templateChildren = [TemplateChild.create(this, Context.clone(context))];
          this.appendToParent();
        } else {
          this.templateChildren = [];
        }
        this.lastViewModelFilteredValue = filteredValue;
      }
      this.lastViewModelValue = value;
    }

    // 子要素の展開を実行
    this.templateChildren.forEach(templateChild => templateChild.updateNode());
  }

  /**
   * @returns {any[]} newValue
   */
  expandLoop() {
    const { component, filters, templateChildren, context } = this;
    /**
     * @type {any[]}
     */
    const lastValue = this.lastViewModelValue ?? [];
    /**
     * @type {any[]}
     */
    const newValue = Filter.applyForOutput(this.getViewModelValue(), filters, component.filters.out) ?? [];

    if (lastValue.length === newValue.length) {
    } else if (lastValue.length > newValue.length) {
      const removeTemplateChildren = this.templateChildren.splice(newValue.length);
      removeTemplateChildren.forEach(templateChild => {
        templateChild.removeFromParent();
        TemplateChild.dispose(templateChild);
      });

    } else if (lastValue.length < newValue.length) {
      // コンテキスト用のデータ
      const pos = context.indexes.length;
      const propName = this.viewModelPropertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      for(let i = lastValue.length; i < newValue.length; i++) {
        const newIndex = i;
        const newContext = Context.clone(context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos})
        this.templateChildren.push(TemplateChild.create(this, newContext))
      }
    }
    this.templateChildren.forEach(templateChild => templateChild.updateNode());

    this.lastViewModelValue = newValue.slice();
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