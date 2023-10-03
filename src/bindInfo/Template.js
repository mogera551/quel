import "../types.js";
import { utils } from "../utils.js";
import { Filter } from "../filter/Filter.js";
import { BindInfo } from "./BindInfo.js";
import { TEMPLATE_BRANCH, TEMPLATE_REPEAT } from "../Const.js";
import { Context } from "../context/Context.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Templates } from "../view/Templates.js";
import { ViewTemplate } from "../view/View.js";

export class TemplateChild {
  /** @type {BindInfo[]} */
  binds;

  /** @type {Node[]} */
  childNodes;

  /** @type {DocumentFragment} */
  fragment;

  /** @type {ContextInfo} */
  context;

  /** @type {string} */
  uuid;

  /** @type {Node} */
  get lastNode() {
    return this.childNodes[this.childNodes.length - 1];
  }

  /** @type {node[]|DocumentFragment} */
  get nodesForAppend() {
    return this.fragment.childNodes.length > 0 ? [this.fragment] : this.childNodes;
  }

  /**
   * 
   */
  removeFromParent() {
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

  /** @type {Map<string,TemplateChild[]>} */
  static templateChildrenByUUID = new Map;

  /**
   * 削除したTemplateChildを再利用のため保存しておく
   * @param {TemplateChild} templateChild 
   */
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
  /** @type {TemplateChild[]} */
  templateChildren = [];

  /** @type {HTMLTemplateElement} */
  #template;
  /** @type {HTMLTemplateElement} */
  get template() {
    if (typeof this.#template === "undefined") {
      this.#template = Templates.templateByUUID.get(this.uuid);
    }
    return this.#template;
  }

  /** @type {string} */
  #uuid;
  /** @type {string} */
  get uuid() {
    if (typeof this.#uuid === "undefined") {
      this.#uuid = this.node.textContent.slice(3);
    }
    return this.#uuid;
  }

  /** @type {number} */
  #lastCount;
  /** @type {number} */
  get lastCount() {
    return (this.#lastCount ?? 0);
  }
  set lastCount(v) {
    this.#lastCount = v;
  }

  /** @type {TemplateChild | undefined} */
  get lastChild() {
    return this.templateChildren[this.templateChildren.length - 1];
  }

  updateNode() {
    (this.nodeProperty === TEMPLATE_REPEAT) ? this.expandLoop() : 
      (this.nodeProperty === TEMPLATE_BRANCH) ? this.expandIf() : utils.raise(`unknown property ${this.nodeProperty}`);
  }

  removeFromParent() {
    this.templateChildren.forEach(templateChild => {
      templateChild.removeFromParent();
      TemplateChild.dispose(templateChild);
    });
    this.templateChildren = [];
    this.lastCount = 0;
  }

  /**
   * 
   * @returns {void}
   */
  expandIf() {
    const { component, filters, context, filteredViewModelValue } = this;
    const currentValue = this.templateChildren.length > 0;
    if (currentValue !== filteredViewModelValue) {
      if (filteredViewModelValue) {
        const newTemplateChildren = [TemplateChild.create(this, Context.clone(context))];
        TemplateBind.appendToParent(this.lastChild?.lastNode ?? this.node, newTemplateChildren);
        this.templateChildren = newTemplateChildren;
      } else {
        TemplateBind.removeFromParent(this.templateChildren);
        this.templateChildren = [];
      }
    } else {
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    }
  }

  /**
   * @returns {void}
   */
  expandLoop() {
    const { component, filters, context, viewModelValue } = this;
    /** @type {any[]} */
    const newValue = Filter.applyForOutput(viewModelValue, filters, component.filters.out) ?? [];

    if (this.lastCount > newValue.length) {
      const removeTemplateChildren = this.templateChildren.splice(newValue.length);
      TemplateBind.removeFromParent(removeTemplateChildren);
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    } else if (this.lastCount < newValue.length) {
      // コンテキスト用のデータ
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
      const pos = context.indexes.length;
      const propName = this.viewModelPropertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      const newTemplateChildren = [];
      for(let i = this.lastCount; i < newValue.length; i++) {
        const newIndex = i;
        const newContext = Context.clone(context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos})
        newTemplateChildren.push(TemplateChild.create(this, newContext))
      }
      TemplateBind.appendToParent(this.lastChild?.lastNode ?? this.node, newTemplateChildren);
      this.templateChildren = this.templateChildren.concat(newTemplateChildren);
    } else {
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    }
    this.lastCount = newValue.length;
  }

  /** 
   * @param {TemplateChild[]} templateChildren
   * @returns {void}
   */
  static removeFromParent(templateChildren) {
    templateChildren.forEach(templateChild => {
      templateChild.removeFromParent();
      TemplateChild.dispose(templateChild);
    });
  }

  /**
   * @param {Node} parentNode
   * @param {TemplateChild[]} templateChildren
   * @returns {void}
   */
  static appendToParent(parentNode, templateChildren) {
    const fragment = document.createDocumentFragment();
    templateChildren
      .forEach(templateChild => {
        if (templateChild.childNodes.length > 0) fragment.appendChild(...templateChild.nodesForAppend);
      });
    parentNode.after(fragment);
  }

}