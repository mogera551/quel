import Filter from "../filter/Filter.js";
import PropertyType, { NodePropertyType } from "../node/PropertyType.js";
import LevelTop from "./LevelTop.js";
import Level2nd from "./Level2nd.js";
import Level3rd from "./Level3rd.js";
import ClassName from "./ClassName.js";
import Radio from "./Radio.js";
import Checkbox from "./Checkbox.js";
import Template from "./Template.js";
import Event from "./Event.js";
import Component from "../component/Component.js";
import PropertyInfo from "../viewModel/PropertyInfo.js";
import BindComponent from "./Component.js";

const createLevelTop = (bindInfo, info) => Object.assign(new LevelTop, bindInfo, info);
const createLevel2nd = (bindInfo, info) => Object.assign(new Level2nd, bindInfo, info);
const createLevel3rd = (bindInfo, info) => Object.assign(new Level3rd, bindInfo, info);
const createClassName = (bindInfo, info) => Object.assign(new ClassName, bindInfo, info);
const createRadio = (bindInfo, info) => Object.assign(new Radio, bindInfo, info);
const createCheckbox = (bindInfo, info) => Object.assign(new Checkbox, bindInfo, info);
const createTemplate = (bindInfo, info) => Object.assign(new Template, bindInfo, info);
const createEvent = (bindInfo, info) => Object.assign(new Event, bindInfo, info);
const createComponent = (bindInfo, info) => Object.assign(new BindComponent, bindInfo, info);

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

export default class Factory {
  /**
   * 
   * @param {{
   * component:Component,
   * node:Node,
   * nodeProperty:string,
   * viewModel:ViewModel,
   * viewModelProperty:string,
   * filters:Filter[],
   * indexes:number[]
   * }}  
   */
  static create({component, node, nodeProperty, viewModel, viewModelProperty, filters, indexes}) {
    const bindInfo = {component, node, nodeProperty, viewModel, viewModelProperty, filters};
    const propInfo = PropertyInfo.create(viewModelProperty);
    bindInfo.indexes = indexes.slice(0, propInfo.loopLevel);
    bindInfo.contextIndexes = indexes;
    const info = PropertyType.getInfo(node, nodeProperty);
    return creatorByType.get(info.type)(bindInfo, info);
  }
}