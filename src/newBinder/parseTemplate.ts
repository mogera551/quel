
import { utils } from '../utils';
import { BindNodeInfo } from './BindNodeInfo2';
import { getBindText } from './bindText';
import { getCommentNodes } from './commentNodes';
import { getNodeType } from './nodeType';
import { BindNodeInfoIf, NodeType } from './types';

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;

export function parseTemplate(template:HTMLTemplateElement, useKeyed:boolean):BindNodeInfoIf[] {
  const nodeInfos:BindNodeInfoIf[] = [];
  const rootElement = template.content;
  const nodes = (Array.from(rootElement.querySelectorAll(SELECTOR)) as Node[]).concat(getCommentNodes(rootElement));
  nodeInfos.length = 0;
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeType = getNodeType(node);
    if (nodeType === NodeType.Unknown) utils.raise(`Binder: unknown node type`);
    const bindText = getBindText(node, nodeType);
    if (bindText.trim() === "") continue;
    nodeInfos[nodeInfos.length] = BindNodeInfo.create(nodes[i], nodeType, bindText, useKeyed);
  }
  return nodeInfos;
}
