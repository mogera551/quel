import "../types.js";
import  { utils } from "../utils.js";
import { Filter } from "../filter/Filter.js";
import { NodePropertyType } from "../node/PropertyType.js";
import { NodePropertyInfo } from "../node/PropertyInfo.js";
import { LevelTop } from "./LevelTop.js";
import { Level2nd } from "./Level2nd.js";
import { Level3rd } from "./Level3rd.js";
import { ClassName } from "./ClassName.js";
import { Radio } from "./Radio.js";
import { Checkbox } from "./Checkbox.js";
import { Template } from "./Template.js";
import { Event } from "./Event.js";
import { dotNotation } from "../../modules/imports.js";
import { ComponentBind } from "./Component.js";

const createLevelTop = (bindInfo, info) => Object.assign(new LevelTop, bindInfo, info);
const createLevel2nd = (bindInfo, info) => Object.assign(new Level2nd, bindInfo, info);
const createLevel3rd = (bindInfo, info) => Object.assign(new Level3rd, bindInfo, info);
const createClassName = (bindInfo, info) => Object.assign(new ClassName, bindInfo, info);
const createRadio = (bindInfo, info) => Object.assign(new Radio, bindInfo, info);
const createCheckbox = (bindInfo, info) => Object.assign(new Checkbox, bindInfo, info);
const createTemplate = (bindInfo, info) => Object.assign(new Template, bindInfo, info);
const createEvent = (bindInfo, info) => Object.assign(new Event, bindInfo, info);
const createComponent = (bindInfo, info) => Object.assign(new ComponentBind, bindInfo, info);

const creatorByType = new Map();
creatorByType.set(NodePropertyType.levelTop, createLevelTop);
creatorByType.set(NodePropertyType.level2nd, createLevel2nd);
creatorByType.set(NodePropertyType.level3rd, createLevel3rd);
creatorByType.set(NodePropertyType.className, createClassName);
creatorByType.set(NodePropertyType.radio, createRadio);
creatorByType.set(NodePropertyType.checkbox, createCheckbox);
creatorByType.set(NodePropertyType.template, createTemplate);
creatorByType.set(NodePropertyType.event, createEvent);
creatorByType.set(NodePropertyType.component, createComponent);

export class Factory {
  /**
   * 
   * @param {{
   * component:import("../component/Component.js").Component,
   * node:Node,
   * nodeProperty:string,
   * viewModel:ViewModel,
   * viewModelProperty:string,
   * filters:Filter[],
   * context:ContextInfo
   * }}
   * @returns {import("../bindInfo/BindInfo.js").BindInfo}
   */
  static create({component, node, nodeProperty, viewModel, viewModelProperty, filters, context}) {
    const bindData = {
      component, node, nodeProperty, viewModel, viewModelProperty, filters, context
    };
    const nodeInfo = NodePropertyInfo.get(node, nodeProperty);
    /**
     * @type {import("../bindInfo/BindInfo.js").BindInfo}
     */
    const bindInfo = creatorByType.get(nodeInfo.type)(bindData, nodeInfo);
    if (bindInfo.viewModelPropertyName.level > 0 && bindInfo.indexes.length == 0) {
      utils.raise(`${bindInfo.viewModelPropertyName.name} be outside loop`);
    }
    return bindInfo;
  }
}