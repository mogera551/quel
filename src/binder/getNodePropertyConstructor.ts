import { utils } from "../utils";
import { NodePropertyCreator } from "./types";
import { IFilterText } from "../filter/types";
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
import { IBinding, INodeProperty } from "../binding/types";

type NodePropertyConstructorByName = {[key:string]:typeof NodeProperty};
type NodePropertyConstructorByNameByIsComment = {[key:number]:NodePropertyConstructorByName};

type SomeNodePropertyConstructor = typeof NodeProperty | typeof Branch | typeof ElementClassName | typeof Checkbox | typeof Radio | typeof ElementEvent | typeof ElementClass | typeof ElementAttribute | typeof ElementStyle | typeof ElementProperty | typeof ComponentProperty | typeof RepeatKeyed | typeof Repeat;

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
(NodeProertyClass:SomeNodePropertyConstructor): NodePropertyCreator =>
(binding: IBinding, node: Node, name: string, filters: IFilterText[]): INodeProperty =>
{
  return Reflect.construct(NodeProertyClass, [binding, node, name, filters]);
};

const nodePropertyConstructorByFirstName:NodePropertyConstructorByFirstName = {
  "class": ElementClass,
  "attr": ElementAttribute,
  "style": ElementStyle,
  "props": ComponentProperty,
};

function _getNodePropertyConstructor(isComment:boolean, isElement: boolean, propertyName: string, useKeyed: boolean): NodePropertyCreator {
  let nodePropertyConstructor: SomeNodePropertyConstructor;
  do {
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
    if (isElement) {
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

const _cache: {[key:string]:NodePropertyCreator} = {};

/**
 * バインドのノードプロパティのコンストラクタを取得する
 */
export function getNodePropertyConstructor(node:Node, propertyName:string, useKeyed:boolean): NodePropertyCreator {
  const isComment = node instanceof Comment;
  const isElement = node instanceof Element;
  const key = isComment + "\t" + isElement + "\t" + propertyName + "\t" + useKeyed;
  return _cache[key] ?? (_cache[key] = _getNodePropertyConstructor(isComment, isElement, propertyName, useKeyed));
}
