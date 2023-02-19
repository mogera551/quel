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

export default class Factory {
  /**
   * 
   * @param {{
   * node:Node,
   * nodeProperty:string,
   * viewModel:ViewModel,
   * viewModelProperty:string,
   * filters:Filter[],
   * indexes:integer[]
   * }}  
   */
  static create({node, nodeProperty, viewModel, viewModelProperty, filters, indexes}) {
    const bindInfo = {node, nodeProperty, viewModel, viewModelProperty, filters, indexes};
    const info = PropertyType.getInfo(node, nodeProperty);
    switch(info.type) {
      case NodePropertyType.levelTop:
        return Object.assign(new LevelTop, bindInfo, info);
      case NodePropertyType.level2nd:
        return Object.assign(new Level2nd, bindInfo, info);
      case NodePropertyType.level3rd:
        return Object.assign(new Level3rd, bindInfo, info);
      case NodePropertyType.className:
        return Object.assign(new ClassName, bindInfo, info);
      case NodePropertyType.radio:
        return Object.assign(new Radio, bindInfo, info);
      case NodePropertyType.checkbox:
        return Object.assign(new Checkbox, bindInfo, info);
      case NodePropertyType.template:
        return Object.assign(new Template, bindInfo, info);
      case NodePropertyType.event:
        return Object.assign(new Event, bindInfo, info);
    }
  
  }
}