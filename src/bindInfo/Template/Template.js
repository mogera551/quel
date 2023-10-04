import "../../types.js";
import { BindInfo } from "../BindInfo.js";
import { Templates } from "../../view/Templates.js";
import { ViewTemplate } from "../../view/View.js";

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

  /** @type {Node[]} */
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

  /** @type {Map<string,TemplateChild[]>} 再利用のためのキャッシュ */
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