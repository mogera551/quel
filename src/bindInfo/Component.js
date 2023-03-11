import BindInfo from "./BindInfo.js";
import { SYM_CALL_BIND_DATA, SYM_CALL_BIND_PROPERTY, SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS } from "../viewModel/Symbols.js";
import Component from "../component/Component.js";

const toComponent = node => (node instanceof Component) ? node : undefined;

export default class ComponentBind extends BindInfo {
  /**
   * @type {Node}
   */
  get node() {
    return super.node;
  }
  set node(node) {
    super.node = node;
    this.bindData();
  }
  /**
   * @type {string}
   */
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.viewModelProperty && this.nodePropertyElements) {
      this.bindProperty();
    }
  }
  /**
   * @type {string[]}
   */
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.viewModelProperty && this.nodePropertyElements) {
      this.bindProperty();
    }
  }
  /**
   * @type {string}
   */
  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }
  /**
   * @type {string}
   */
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  /**
   * 
   */
  bindData() {
    const component = toComponent(this.node);
    component?.data[SYM_CALL_BIND_DATA](component);
  }

  /**
   * 
   */
  bindProperty() {
    const component = toComponent(this.node);
    component?.data[SYM_CALL_BIND_PROPERTY](this.dataProperty, this.viewModelProperty, this.indexes)
  }

  updateNode() {
    const { node, dataProperty } = this;
    const thisComponent = toComponent(node);
    thisComponent.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$data.${dataProperty}`, []);
  }

  updateViewModel() {
  }

}