import "../types.js";
import utils from "../utils.js";
import NodePropertyTypeGetter, { NodePropertyType } from "../node/PropertyType.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_SET, SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_CALL } from "../viewModel/Symbols.js";
import BindToTemplate from "./BindToTemplate.js";

const PREFIX_EVENT = "on";
const toHTMLElement = node => node instanceof HTMLElement ? node : utils.raise(`not HTMLElement`);
const toHTMLInputElement = node => node instanceof HTMLInputElement ? node : utils.raise(`not HTMLInputElement`);

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

export default class BindInfo {
  /**
   * @type {Node}
   */
  node;
  /**
   * @type {HTMLElement}
   */
  get element() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /**
   * @type {HTMLTemplateElement}
   */
  get template() {
    return (this.node instanceof HTMLTemplateElement) ? this.node : utils.raise("not HTMLTemplateElement");
  }
  /**
   * @type {string}
   */
  #nodeProperty;
  /**
   * @type {string}
   */
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(property) {
    this.#nodeProperty = property;
    this.#nodePropertyType = NodePropertyTypeGetter.get(property);
  }

  /**
   * @type {NodePropertyType} 
   */
  #nodePropertyType;
  /**
   * @type {NodePropertyType} 
   */
  get nodePropertyType() {
    return this.isTemplate ? NodePropertyType.template : 
           this.isEvent ? NodePropertyType.event : this.#nodePropertyType;
  }

  /**
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {string}
   */
  viewModelProperty;
  /**
   * @type {Filter[]}
   */
  filters;
  /**
   * @type {string[]}
   */
  indexes;

  /**
   * @type {TemplateChild[]}
   */
  templateChildren = [];

  /**
   * @type {boolean}
   */
  get isEvent() {
    return this.nodeProperty.startsWith(PREFIX_EVENT);
  }

  /**
   * @type {boolean}
   */
  get isElement() {
    return this.node instanceof HTMLElement;
  }

  /**
   * @type {boolean}
   */
  get isTemplate() {
    return this.node instanceof HTMLTemplateElement;
  }

  /**
   * @type {boolean}
   */
  get isInputable() {
    if (!this.isElement) return false;
    return utils.isInputableElement(this.element);
  }

  /**
   * @type {string}
   */
  get eventType() {
    return this.isEvent ? this.nodeProperty.slice(2) : undefined;
  }

  /**
   * Nodeのプロパティを更新する
   */
  updateNode() {
    switch (this.nodePropertyType) {
      case NodePropertyType.levelTop: this.#updateNodeByTopLevel(); break;
      case NodePropertyType.level2nd: this.#updateNodeBy2ndLevel(); break;
      case NodePropertyType.level3rd: this.#updateNodeBy3rdLevel(); break;
      case NodePropertyType.className: this.#updateNodeByClassName(); break;
      case NodePropertyType.radio: this.#updateNodeByRadio(); break;
      case NodePropertyType.checkbox: this.#updateNodeByCheckbox(); break;
      case NodePropertyType.template: this.#updateNodeByTemplate(); break;
      case NodePropertyType.event: break;
      default: utils.raise(`unknown nodePropertyType ${this.nodePropertyType}`);
    }
  }

  #updateNodeByTopLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    node[nodeProperty] = value;
  }

  #updateNodeBy2ndLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [nodeProp1, nodeProp2] = nodeProperty.split(".");
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    node[nodeProp1][nodeProp2] = value;
  }

  #updateNodeBy3rdLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [nodeProp1, nodeProp2, nodeProp3] = nodeProperty.split(".");
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    node[nodeProp1][nodeProp2][nodeProp3] = value;
  }

  #updateNodeByClassName() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [type, className] = nodeProperty.split(".");
    const element = toHTMLElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    value ? element.classList.add(className) : element.classList.remove(className);
  }

  #updateNodeByRadio() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const radio = toHTMLInputElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    radio.checked = value === radio.value;
  }

  #updateNodeByCheckbox() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const checkbox = toHTMLInputElement(node);
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes), filters);
    checkbox.checked = value.find(value => value === checkbox.value);
  }

  #updateNodeByTemplate() {
    this.removeFromParent();
    this.templateChildren = BindToTemplate.expand(this);
    this.appendToParent();
  }
  /**
   * ViewModelのプロパティを更新する
   */
  updateViewModel() {
    switch (this.nodePropertyType) {
      case NodePropertyType.levelTop: this.#updateViewModelByTopLevel(); break;
      case NodePropertyType.level2nd: this.#updateViewModelBy2ndLevel(); break;
      case NodePropertyType.level3rd: this.#updateViewModelBy3rdLevel(); break;
      case NodePropertyType.className: this.#updateViewModelByClassName(); break;
      case NodePropertyType.radio: this.#updateViewModelByRadio(); break;
      case NodePropertyType.checkbox: this.#updateViewModelByCheckbox(); break;
      case NodePropertyType.template: break;
      case NodePropertyType.event: break;
      default: utils.raise(`unknown nodePropertyType ${this.nodePropertyType}`);
    }
  }

  #updateViewModelByTopLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const value = Filter.applyForInput(node[nodeProperty], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
  }

  #updateViewModelBy2ndLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [nodeProp1, nodeProp2] = nodeProperty.split(".");
    const value = Filter.applyForInput(node[nodeProp1][nodeProp2], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
  }

  #updateViewModelBy3rdLevel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [nodeProp1, nodeProp2, nodeProp3] = nodeProperty.split(".");
    const value = Filter.applyForInput(node[nodeProp1][nodeProp2][nodeProp3], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
  }

  #updateViewModelByClassName() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const [type, className] = nodeProperty.split(".");
    const element = toHTMLElement(node);
    const value = Filter.applyForInput(element.classList.contains(className), filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
  }

  #updateViewModelByRadio() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const radio = toHTMLInputElement(node);
    const radioValue = Filter.applyForInput(radio.value, filters);
    if (radio.checked) {
      viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, radioValue);
    }
  }

  #updateViewModelByCheckbox() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = bind;
    const checkbox = toHTMLInputElement(node);
    const checkboxValue = Filter.applyForInput(checkbox.value, filters);
    const value = new Set(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes));
    (checkbox.checked) ? value.add(checkboxValue) : value.delete(checkboxValue);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, Array.from(value));
  }

  /**
   * 
   */
  removeFromParent() {
    this.templateChildren.flatMap(child => child.childNodes).forEach(node => {
      node.parentNode.removeChild(node);
    });
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
  addEventListener() {
    const {element, eventType, viewModel, viewModelProperty, indexes, filters} = this;
    element.addEventListener(eventType, (event) => {
      viewModel[SYM_CALL_DIRECT_CALL](viewModelProperty, indexes, event);
    });
  }

  /**
   * 
   * @param {BindInfo} binds 
   */
  static setInitialValue(binds) {
    const traverse = bind => 
      [bind].concat(
        bind.templateChildren.flatMap(child => 
          child.binds.flatMap(bind => traverse(bind))
        )
      );
    binds.flatMap(traverse).forEach(bind => {
      bind.updateNode();
    });
  }

}