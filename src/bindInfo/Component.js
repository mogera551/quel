import BindInfo from "./BindInfo.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_BIND_DATA, SYM_CALL_BIND_PROPERTY, SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS } from "../viewModel/Symbols.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";
import Component from "../component/Component.js";

const toComponent = node => (node instanceof Component) ? node : undefined;

export default class ComponentBind extends BindInfo {
  get node() {
    return super.node;
  }
  set node(node) {
    const component = toComponent(node);
    component?.data[SYM_CALL_BIND_DATA](component);
    super.node = node;
  }
  get nodeProperty() {
    return super.nodeProperty;
  }
  bindProp() {
    const component = toComponent(this.node);
    component?.data[SYM_CALL_BIND_PROPERTY](this.dataProperty, this.viewModelProperty)
  }
  set nodeProperty(value) {
    super.nodeProperty = value;
  }
  get viewModelProperty() {
    return super.viewModelProperty;
  }
  set viewModelProperty(value) {
    super.viewModelProperty = value;
    if (this.viewModelProperty && this.nodePropertyElements) {
      this.bindProp();
    }
  }
  get nodePropertyElements() {
    return super.nodePropertyElements;
  }
  set nodePropertyElements(value) {
    super.nodePropertyElements = value;
    if (this.viewModelProperty && this.nodePropertyElements) {
      this.bindProp();
    }
  }

  get dataNameProperty() {
    return this.nodePropertyElements[0];
  }
  get dataProperty() {
    return this.nodePropertyElements[1];
  }

  updateNode() {
    const {component, node, nodeProperty, dataProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const thisComponent = toComponent(node);
    thisComponent.viewModel?.[SYM_CALL_NOTIFY_FOR_DEPENDENT_PROPS](`$data.${dataProperty}`, []);
  }

  updateViewModel() {
/*
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const thisComponent = toComponent(node);
    const value = Filter.applyForInput(node[nodeProperty], filters);
    thisComponent.data
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
*/
  }

}