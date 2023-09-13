import "../types.js";
import { utils } from "../utils.js";
import { Filter } from "../filter/Filter.js";
import { NodePropertyType } from "../node/PropertyType.js";
import { NodePropertyInfo } from "../node/PropertyInfo.js";
import { AttributeBind } from "./Attribute.js";
import { ClassListBind } from "./Classlist.js";
import { ClassNameBind } from "./ClassName.js";
import { Radio } from "./Radio.js";
import { Checkbox } from "./Checkbox.js";
import { TemplateBind } from "./Template.js";
import { Event } from "./Event.js";
import { ComponentBind } from "./Component.js";
import { StyleBind } from "./Style.js";
import { PropertyBind } from "./Property.js";
import { TextBind } from "./Text.js";

const classByType = {};
classByType[NodePropertyType.property] = PropertyBind;
classByType[NodePropertyType.attribute] = AttributeBind;
classByType[NodePropertyType.classList] = ClassListBind;
classByType[NodePropertyType.className] = ClassNameBind;
classByType[NodePropertyType.radio] = Radio;
classByType[NodePropertyType.checkbox] = Checkbox;
classByType[NodePropertyType.template] = TemplateBind;
classByType[NodePropertyType.event] = Event;
classByType[NodePropertyType.component] = ComponentBind;
classByType[NodePropertyType.style] = StyleBind;
classByType[NodePropertyType.text] = TextBind;

export class Factory {
  /**
   * @param {Component} component
   * @param {Node} node
   * @param {string} nodeProperty
   * @param {ViewModel} viewModel
   * @param {string} viewModelProperty
   * @param {Filter[]} filters
   * @param {ContextInfo} context
   * @returns {BindInfo}
   */
  static create(component, node, nodeProperty, viewModel, viewModelProperty, filters, context) {
    const nodeInfo = NodePropertyInfo.get(node, nodeProperty);
    /**
     * @type {BindInfo}
     */
    const bindInfo = new classByType[nodeInfo.type];
    bindInfo.component = component;
    bindInfo.node = node;
    bindInfo.nodeProperty = nodeProperty;
    bindInfo.viewModel = viewModel;
    bindInfo.viewModelProperty = viewModelProperty;
    bindInfo.filters = filters;
    bindInfo.context = context;
    bindInfo.nodePropertyElements = nodeInfo.nodePropertyElements;
    bindInfo.eventType = nodeInfo.eventType;
    if (bindInfo.viewModelPropertyName.level > 0 && bindInfo.indexes.length === 0) {
      utils.raise(`${bindInfo.viewModelPropertyName.name} is outside loop`);
    }
    return bindInfo;
  }
}