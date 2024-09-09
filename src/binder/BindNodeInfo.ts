import { IBindNodeInfo, BindTextInfo, NodeType, NodeRoute, NodeRouteKey, ParsedBindTextInfo } from './types';
import { replaceTextNodeFromComment } from './replaceTextNodeFromComment';
import { removeDataBindAttribute } from './removeDataBindAttribute';
import { canNodeAcceptInput } from './canNodeAcceptInput';
import { parseBindText } from './parseBindText';
import { getDefaultPropertyForNode } from './getDefaultPropertyForNode';
import { getPropertyCreators } from './getPropertyCreators';
import { createBindingWithBindInfo } from './createBinding';
import { computeNodeRoute } from './computeNodeRoute';
import { initializeForNode } from './initializeForNode';
import { IBinding } from '../binding/types';

export class BindNodeInfo implements IBindNodeInfo {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTextInfos: BindTextInfo[];
  acceptInput: boolean;
  defaultProperty: string;
  initializeForNode: (node:Node,bindings:IBinding[])=>void;
  constructor(
    nodeType: NodeType, 
    nodeRoute: NodeRoute, 
    nodeRouteKey: NodeRouteKey, 
    bindTextInfos: BindTextInfo[], 
    acceptInput: boolean, 
    defaultProperty: string, 
    initializeForNode: (bindInfo:IBindNodeInfo)=>(node:Node,bindings:IBinding[])=>void
  ) {
    this.nodeType = nodeType;
    this.nodeRoute = nodeRoute;
    this.nodeRouteKey = nodeRouteKey;
    this.bindTextInfos = bindTextInfos;
    this.acceptInput = acceptInput;
    this.defaultProperty = defaultProperty
    this.initializeForNode = initializeForNode(this);
  }

  static create(node:Node, nodeType:NodeType, bindText:string, useKeyed:boolean):IBindNodeInfo {
    node = replaceTextNodeFromComment(node, nodeType); // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
    removeDataBindAttribute(node, nodeType);
    const acceptInput: boolean = canNodeAcceptInput(node, nodeType);
    const defaultProperty: string = getDefaultPropertyForNode(node, nodeType) ?? "";
    const parseBindTextInfos: ParsedBindTextInfo[] = parseBindText(bindText, defaultProperty);
    const bindTextInfos: BindTextInfo[] = [];
    for(let j = 0; j < parseBindTextInfos.length; j++) {
      const parseBindTextInfo = parseBindTextInfos[j];
      const { nodeProperty, stateProperty } = parseBindTextInfo;
      const propertyCreators = getPropertyCreators(node, nodeProperty, stateProperty, useKeyed);
      bindTextInfos.push({ ...parseBindTextInfo, ...propertyCreators, createBinding: createBindingWithBindInfo(parseBindTextInfo, propertyCreators) });
    }
    const nodeRoute = computeNodeRoute(node);
    const nodeRouteKey = nodeRoute.join(",");
    return new BindNodeInfo(
      nodeType, 
      nodeRoute, 
      nodeRouteKey, 
      bindTextInfos, 
      acceptInput, 
      defaultProperty, 
      initializeForNode
    );
  }
}


