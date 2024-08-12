import { utils } from "../utils";
import { PropertyCreators } from "./types";
import { IBinding, INodeProperty, IStateProperty } from "../@types/binding";
import { IFilterInfo } from "../@types/filter";
import { StateProperty } from "../binding/stateProperty/StateProperty";
import { NodeProperty } from "../binding/nodeProperty/NodeProperty";
import { ContextIndex } from "../binding/stateProperty/ContextIndex";
import { Repeat } from "../binding/nodeProperty/Repeat";
import { Branch } from "../binding/nodeProperty/Branch";
import { ElementClassName } from "../binding/nodeProperty/ElementClassName"
import { Checkbox } from "../binding/nodeProperty/Checkbox";
import { Radio } from "../binding/nodeProperty/Radio";
import { ElementEvent } from "../binding/nodeProperty/ElementEvent";
import { ElementClass } from "../binding/nodeProperty/ElementClass";
import { ElementAttribute } from "../binding/nodeProperty/ElementAttribute";
import { ElementStyle } from "../binding/nodeProperty/ElementStyle";
import { ElementProperty } from "../binding/nodeProperty/ElementProperty";
import { ComponentProperty } from "../binding/nodeProperty/ComponentProperty";
import { RepeatKeyed } from "../binding/nodeProperty/RepeatKeyed";

const regexp = RegExp(/^\$[0-9]+$/);

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
 * get constructors for NodeProperty and StateProperty
 */
export const getPropertyCreators = (node:Node, nodePropertyName:string, statePropertyName:string, useKeyed:boolean):PropertyCreators => {
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
    statePropertyCreator:createStateProperty(statePropertyClass), 
  };
}
