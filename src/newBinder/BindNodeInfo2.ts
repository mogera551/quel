import { BindNodeInfoIf, BindTextInfo, NodeType, NodeRoute, NodeRouteKey, ParseBindTextInfo } from './types';
import { Binding } from '../binding/Binding';
import { replaceTextNode } from './replaceTextNode';
import { removeAttribute } from './removeAttribute';
import { getIsInputable } from './isInputable';
import { parse } from './parseBindText';
import { getDefaultProperty } from './defaultProperty';
import { getConstructors } from './constructors';
import { createBinding } from './createBinding';
import { computeNodeRoute } from './nodeRoute';
import { initializeNode } from './initializeNode';

export class BindNodeInfo implements BindNodeInfoIf {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  isInputable: boolean;
  defaultProperty: string;
  initializeNode: (node:Node,bindings:Binding[])=>void;
  constructor(
    nodeType: NodeType, 
    nodeRoute: NodeRoute, 
    nodeRouteKey: NodeRouteKey, 
    bindTextInfos: BindTextInfo[], 
    isInputable: boolean, 
    defaultProperty: string, 
    initializeNode: (bindInfo:BindNodeInfoIf)=>(node:Node,bindings:Binding[])=>void) {
    this.nodeType = nodeType;
    this.nodeRoute = nodeRoute;
    this.nodeRouteKey = nodeRouteKey;
    this.bindTextInfos = bindTextInfos;
    this.isInputable = isInputable;
    this.defaultProperty = defaultProperty
    this.initializeNode = initializeNode(this);
  }

  static create(node:Node, nodeType:NodeType, bindText:string, useKeyed:boolean):BindNodeInfoIf {
    node = replaceTextNode(node, nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
    removeAttribute(node, nodeType);
    const isInputable:boolean = getIsInputable(node, nodeType);
    const defaultProperty:string = getDefaultProperty(node, nodeType) ?? "";
    const parseBindTextInfos:ParseBindTextInfo[] = parse(bindText, defaultProperty);
    const bindTextInfos:BindTextInfo[] = [];
    for(let j = 0; j < parseBindTextInfos.length; j++) {
      const parseBindTextInfo = parseBindTextInfos[j];
      const { nodeProperty, stateProperty } = parseBindTextInfo;
      const constructors = getConstructors(node, nodeProperty, stateProperty, useKeyed);
      bindTextInfos.push({ ...parseBindTextInfo, ...constructors, createBinding: createBinding(parseBindTextInfo, constructors) });
    }
    const nodeRoute = computeNodeRoute(node);
    const nodeRouteKey = nodeRoute.join(",");
    return new BindNodeInfo(
      nodeType, 
      nodeRoute, 
      nodeRouteKey, 
      bindTextInfos, 
      isInputable, 
      defaultProperty, 
      initializeNode
    );
  }
}


