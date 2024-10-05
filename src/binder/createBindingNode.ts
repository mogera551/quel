import { IBindingNode, BindText, NodeType, NodeRoute, NodeRouteKey, ParsedBindText } from './types';
import { replaceTextNodeFromComment } from './replaceTextNodeFromComment';
import { removeDataBindAttribute } from './removeDataBindAttribute';
import { canNodeAcceptInput } from './canNodeAcceptInput';
import { parseBindText } from './parseBindText';
import { getDefaultPropertyForNode } from './getDefaultPropertyForNode';
import { getPropertyConstructors } from './getPropertyConstructors';
import { getCreateBinding } from './getCreateBinding';
import { computeNodeRoute } from './computeNodeRoute';
import { initializeForNode } from './initializeForNode';
import { IBinding } from '../binding/types';

class BindingNode implements IBindingNode {
  nodeType: NodeType;
  nodeRoute: NodeRoute;
  nodeRouteKey: NodeRouteKey;
  bindTexts: BindText[];
  acceptInput: boolean;
  defaultProperty: string;
  initializeForNode: (node:Node,bindings:IBinding[])=>void;
  constructor(
    nodeType: NodeType, 
    nodeRoute: NodeRoute, 
    nodeRouteKey: NodeRouteKey, 
    bindTexts: BindText[], 
    acceptInput: boolean, 
    defaultProperty: string 
  ) {
    this.nodeType = nodeType;
    this.nodeRoute = nodeRoute;
    this.nodeRouteKey = nodeRouteKey;
    this.bindTexts = bindTexts;
    this.acceptInput = acceptInput;
    this.defaultProperty = defaultProperty
    this.initializeForNode = initializeForNode(this);
  }

}

/**
 * バインディングノードを生成する
 * @param node ノード
 * @param nodeType ノードタイプ
 * @param bindText バインドテキスト
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {IBindingNode} バインディングノード
 */
export function createBindingNode(
  node: Node, 
  nodeType: NodeType, 
  bindText: string, 
  useKeyed: boolean
): IBindingNode {
  // CommentNodeをTextに置換、template.contentの内容が書き換わることに注意
  node = replaceTextNodeFromComment(node, nodeType);
  // data-bind属性を削除する
  removeDataBindAttribute(node, nodeType);

  const acceptInput: boolean = canNodeAcceptInput(node, nodeType);
  const defaultProperty: string = getDefaultPropertyForNode(node, nodeType) ?? "";
  const parsedBindTexts: ParsedBindText[] = parseBindText(bindText, defaultProperty);
  const bindTexts: BindText[] = [];
  for(let j = 0; j < parsedBindTexts.length; j++) {
    const parsedBindText = parsedBindTexts[j];
    const { nodeProperty, stateProperty } = parsedBindText;
    const propertyConstructors = getPropertyConstructors(node, nodeProperty, stateProperty, useKeyed);
    bindTexts.push({ ...parsedBindText, ...propertyConstructors, createBinding: getCreateBinding(parsedBindText, propertyConstructors) });
  }
  const nodeRoute = computeNodeRoute(node);
  const nodeRouteKey = nodeRoute.join(",");
  return new BindingNode(
    nodeType, 
    nodeRoute, 
    nodeRouteKey, 
    bindTexts, 
    acceptInput, 
    defaultProperty
  );
}


