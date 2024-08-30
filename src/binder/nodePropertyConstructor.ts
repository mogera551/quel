import { utils } from "../utils";
import { NodePropertyCreator } from "../@types/binder";
import { IFilterInfo } from "../@types/filter";
import { NodeProperty } from "../binding/nodeProperty/NodeProperty";
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
import { IBinding, INodeProperty } from "../@types/binding";

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

const createNodeProperty = 
(NodeProertyClass:typeof NodeProperty):NodePropertyCreator =>
(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]):INodeProperty =>
{
  return Reflect.construct(NodeProertyClass, [binding, node, name, filters]);
};

const nodePropertyConstructorByFirstName:NodePropertyConstructorByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
  "props": ComponentProperty,
};

export function getNodePropertyConstructor(node:Node, propertyName:string, useKeyed:boolean) {
  let nodePropertyConstructor:typeof NodeProperty;
  do {
    const isComment = node instanceof Comment;
    nodePropertyConstructor = nodePropertyConstructorByNameByIsComment[isComment ? 0 : 1][propertyName];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (isComment && propertyName === "loop") {
      nodePropertyConstructor = useKeyed ? RepeatKeyed : Repeat;
      break;
    }
    if (isComment) utils.raise(`NodePropertyCreateor: unknown node property ${propertyName}`);
    const nameElements = propertyName.split(".");
    nodePropertyConstructor = nodePropertyConstructorByFirstName[nameElements[0]];
    if (typeof nodePropertyConstructor !== "undefined") break;
    if (node instanceof Element) {
      if (propertyName.startsWith("on")) {
        nodePropertyConstructor = ElementEvent;
      } else {
        nodePropertyConstructor = ElementProperty;
      }
    } else {
      nodePropertyConstructor = NodeProperty;
    }
  } while(false);
  return createNodeProperty(nodePropertyConstructor);
}
