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

const createPropertyBind = (bindInfo, info) => Object.assign(new PropertyBind, bindInfo, info);
const createAttributeBind = (bindInfo, info) => Object.assign(new AttributeBind, bindInfo, info);
const createClassListBind = (bindInfo, info) => Object.assign(new ClassListBind, bindInfo, info);
const createClassNameBind = (bindInfo, info) => Object.assign(new ClassNameBind, bindInfo, info);
const createRadio = (bindInfo, info) => Object.assign(new Radio, bindInfo, info);
const createCheckbox = (bindInfo, info) => Object.assign(new Checkbox, bindInfo, info);
const createTemplateBind = (bindInfo, info) => Object.assign(new TemplateBind, bindInfo, info);
const createEvent = (bindInfo, info) => Object.assign(new Event, bindInfo, info);
const createComponent = (bindInfo, info) => Object.assign(new ComponentBind, bindInfo, info);
const createStyleBind = (bindInfo, info) => Object.assign(new StyleBind, bindInfo, info);
const createTextBind = (bindInfo, info) => Object.assign(new TextBind, bindInfo, info);

const creatorByType = new Map();
creatorByType.set(NodePropertyType.property, createPropertyBind);
creatorByType.set(NodePropertyType.attribute, createAttributeBind);
creatorByType.set(NodePropertyType.classList, createClassListBind);
creatorByType.set(NodePropertyType.className, createClassNameBind);
creatorByType.set(NodePropertyType.radio, createRadio);
creatorByType.set(NodePropertyType.checkbox, createCheckbox);
creatorByType.set(NodePropertyType.template, createTemplateBind);
creatorByType.set(NodePropertyType.event, createEvent);
creatorByType.set(NodePropertyType.component, createComponent);
creatorByType.set(NodePropertyType.style, createStyleBind);
creatorByType.set(NodePropertyType.style, createTextBind);

export class Factory {
  /**
   * 
   * @param {{
   * component:Component,
   * node:Node,
   * nodeProperty:string,
   * viewModel:ViewModel,
   * viewModelProperty:string,
   * filters:Filter[],
   * context:ContextInfo
   * }}
   * @returns {BindInfo}
   */
  static create({component, node, nodeProperty, viewModel, viewModelProperty, filters, context}) {
    const bindData = {
      component, node, nodeProperty, viewModel, viewModelProperty, filters, context
    };
    const nodeInfo = NodePropertyInfo.get(node, nodeProperty);
    /**
     * @type {BindInfo}
     */
    const bindInfo = creatorByType.get(nodeInfo.type)(bindData, nodeInfo);
    if (bindInfo.viewModelPropertyName.level > 0 && bindInfo.indexes.length == 0) {
      utils.raise(`${bindInfo.viewModelPropertyName.name} is outside loop`);
    }
    return bindInfo;
  }
}