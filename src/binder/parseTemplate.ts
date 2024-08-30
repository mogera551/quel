import { IBindNodeInfo } from './types';
import { BindNodeInfo } from './BindNodeInfo';
import { getBindText } from './bindText';
import { getCommentNodes } from './commentNodes';
import { getNodeType } from './nodeType';

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;

export function parseTemplate(template:HTMLTemplateElement, useKeyed:boolean):IBindNodeInfo[] {
  const nodeInfos:IBindNodeInfo[] = [];
  const rootElement = template.content;
  const nodes = (Array.from(rootElement.querySelectorAll(SELECTOR)) as Node[]).concat(getCommentNodes(rootElement));
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeType = getNodeType(node);
    const bindText = getBindText(node, nodeType);
    if (bindText.trim() === "") continue;
    nodeInfos[nodeInfos.length] = BindNodeInfo.create(nodes[i], nodeType, bindText, useKeyed);
  }
  return nodeInfos;
}
