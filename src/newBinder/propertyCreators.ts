import { utils } from "../utils";
import { PropertyCreators, NodePropertyCreator, StatePropertyCreator } from "./types";
import { IBinding, IBindingManager, INodeProperty, IStateProperty } from "../binding/types";
import { IFilterInfo } from "../filter/types";
import { StateProperty } from "../binding/stateProperty/StateProperty";
import { NodeProperty } from "../binding/nodeProperty/NodeProperty";
import { ContextIndex } from "../binding/stateProperty/ContextIndex";
import { Repeat } from "../binding/nodeProperty/Repeat.js";
import { Branch } from "../binding/nodeProperty/Branch_.js";
import { ElementClassName } from "../binding/nodeProperty/ElementClassName.js"
import { Checkbox } from "../binding/nodeProperty/Checkbox_.js";
import { Radio } from "../binding/nodeProperty/Radio_.js";
import { ElementEvent } from "../binding/nodeProperty/ElementEvent.js";
import { ElementClass } from "../binding/nodeProperty/ElementClass.js";
import { ElementAttribute } from "../binding/nodeProperty/ElementAttribute.js";
import { ElementStyle } from "../binding/nodeProperty/ElementStyle.js";
import { ElementProperty } from "../binding/nodeProperty/ElementProperty.js";
import { ComponentProperty } from "../binding/nodeProperty/ComponentProperty.js";
import { RepeatKeyed } from "../binding/nodeProperty/RepeatKeyed.js";

const regexp = RegExp(/^\$[0-9]+$/);

/** @type {Object<boolean,Object<string,typeof NodeProperty>>} */

type NodePropertyConstructorByName = {[key:string]:typeof NodeProperty};
type NodePropertyConstructorByNameByIsComment = {[key:number]:NodePropertyConstructorByName};

const nodePropertyConstructorByNameByIsComment:NodePropertyConstructorByNameByIsComment = {
  0: {
    "if": Branch,
  },
  1: {
    "class": ElementClassName,
    "checkbox": Checkbox,
    "radio": Radio,
  }
};

type NodePropertyConstructorByFirstName = {[key:string]:typeof NodeProperty};

const createNodeProperty = (NodeProertyClass:typeof NodeProperty)=>
  (binding:IBinding, node:Node, name:string, filters:IFilterInfo[]):INodeProperty=>
{
  return Reflect.construct(NodeProertyClass, [binding, node, name, filters]);
};
const createStateProperty = (StatePropertyClass:typeof StateProperty)=>
  (binding:IBinding, name:string, filters:IFilterInfo[]):IStateProperty => 
{
  return Reflect.construct(StatePropertyClass, [binding, name, filters]);
}

const nodePropertyConstructorByFirstName:NodePropertyConstructorByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
  "props": ComponentProperty,
};

/**
 * get constructors for NodeProperty and ViewModelProperty
 */
export const getPropertyCreators = (node:Node, nodePropertyName:string, statePropertyName:string, useKeyed:boolean):PropertyCreators {
  const statePropertyClass = regexp.test(statePropertyName) ? ContextIndex : StateProperty;
  let nodePropertyClass:typeof NodeProperty;
  do {
    const isComment = node instanceof Comment;
    nodePropertyClass = nodePropertyConstructorByNameByIsComment[isComment ? 0 : 1][nodePropertyName];
    if (typeof nodePropertyClass !== "undefined") break;
    if (isComment && nodePropertyName === "loop") {
      nodePropertyClass = useKeyed ? RepeatKeyed : Repeat;
      break;
    }
    if (isComment) utils.raise(`Factory: unknown node property ${nodePropertyName}`);
    const nameElements = nodePropertyName.split(".");
    nodePropertyClass = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof nodePropertyClass !== "undefined") break;
    if (node instanceof Element) {
      if (nodePropertyName.startsWith("on")) {
        nodePropertyClass = ElementEvent;
      } else {
        nodePropertyClass = ElementProperty;
      }
    } else {
      nodePropertyClass = NodeProperty;
    }
  } while(false);
  return { 
    nodePropertyCreator:createNodeProperty(nodePropertyClass),
    statePropertyCreator:createStateProperty(statePropertyClass), };
}
