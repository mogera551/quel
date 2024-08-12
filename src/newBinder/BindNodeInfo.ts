import { IBindNodeInfo, BindTextInfo, NodeType, NodeRoute, NodeRouteKey, ParseBindTextInfo } from '../@types/binder';
import { IBinding } from '../@types/binding';
import { replaceTextNode } from './replaceTextNode';
import { removeAttribute } from './removeAttribute';
import { getIsInputable } from './isInputable';
import { parse } from './parseBindText';
import { getDefaultProperty } from './defaultProperty';
import { getPropertyCreators } from './propertyCreators';
import { createBinding } from './createBinding';
import { computeNodeRoute } from './nodeRoute';
import { initializeNode } from './initializeNode';

export class BindNodeInfo implements IBindNodeInfo {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  isInputable: boolean;
  defaultProperty: string;
  initializeNode: (node:Node,bindings:IBinding[])=>void;
  constructor(
    nodeType: NodeType, 
    nodeRoute: NodeRoute, 
    nodeRouteKey: NodeRouteKey, 
    bindTextInfos: BindTextInfo[], 
    isInputable: boolean, 
    defaultProperty: string, 
    initializeNode: (bindInfo:IBindNodeInfo)=>(node:Node,bindings:IBinding[])=>void
  ) {
    this.nodeType = nodeType;
    this.nodeRoute = nodeRoute;
    this.nodeRouteKey = nodeRouteKey;
    this.bindTextInfos = bindTextInfos;
    this.isInputable = isInputable;
    this.defaultProperty = defaultProperty
    this.initializeNode = initializeNode(this);
  }

  static create(node:Node, nodeType:NodeType, bindText:string, useKeyed:boolean):IBindNodeInfo {
    node = replaceTextNode(node, nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
    removeAttribute(node, nodeType);
    const isInputable:boolean = getIsInputable(node, nodeType);
    const defaultProperty:string = getDefaultProperty(node, nodeType) ?? "";
    const parseBindTextInfos:ParseBindTextInfo[] = parse(bindText, defaultProperty);
    const bindTextInfos:BindTextInfo[] = [];
    for(let j = 0; j < parseBindTextInfos.length; j++) {
      const parseBindTextInfo = parseBindTextInfos[j];
      const { nodeProperty, stateProperty } = parseBindTextInfo;
      const propertyCreators = getPropertyCreators(node, nodeProperty, stateProperty, useKeyed);
      bindTextInfos.push({ ...parseBindTextInfo, ...propertyCreators, createBinding: createBinding(parseBindTextInfo, propertyCreators) });
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


