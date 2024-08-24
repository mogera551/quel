import { utils } from "../utils";
import { NodePropertyCreator } from "./types";
import { IFilterInfo } from "../@types/filter";
import { NodeProperty } from "../newBinding/nodeProperty/NodeProperty";
import { Repeat } from "../newBinding/nodeProperty/Repeat";
import { Branch } from "../newBinding/nodeProperty/Branch";
import { ElementClassName } from "../newBinding/nodeProperty/ElementClassName"
import { Checkbox } from "../newBinding/nodeProperty/Checkbox";
import { Radio } from "../newBinding/nodeProperty/Radio";
import { ElementEvent } from "../newBinding/nodeProperty/ElementEvent";
import { ElementClass } from "../newBinding/nodeProperty/ElementClass";
import { ElementAttribute } from "../newBinding/nodeProperty/ElementAttribute";
import { ElementStyle } from "../newBinding/nodeProperty/ElementStyle";
import { ElementProperty } from "../newBinding/nodeProperty/ElementProperty";
import { ComponentProperty } from "../newBinding/nodeProperty/ComponentProperty";
import { RepeatKeyed } from "../newBinding/nodeProperty/RepeatKeyed";
import { INewBinding, INewNodeProperty } from "../newBinding/types";

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
(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]):INewNodeProperty =>
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
