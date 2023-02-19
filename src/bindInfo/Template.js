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
}