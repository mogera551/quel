import { IBindNodeInfo } from './types';
import { BindNodeInfo } from './BindNodeInfo';
import { getBindTextByNodeType } from './getBindTextByNodeType';
import { getExpandableComments } from './getExpandableComments';
import { getNodeType } from './getNodeType';

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;

/**
 * HTMLテンプレートからバインドノード情報を抽出する
 */
export function extractBindNodeInfosFromTemplate(template: HTMLTemplateElement, useKeyed: boolean): IBindNodeInfo[] {
  const nodeInfos: IBindNodeInfo[] = [];
  const rootElement = template.content;
  const nodes = (Array.from(rootElement.querySelectorAll(SELECTOR)) as Node[]).concat(getExpandableComments(rootElement));
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeType = getNodeType(node);
    const bindText = getBindTextByNodeType(node, nodeType);
    if (bindText.trim() === "") continue;
    nodeInfos[nodeInfos.length] = BindNodeInfo.create(nodes[i], nodeType, bindText, useKeyed);
  }
  return nodeInfos;
}
