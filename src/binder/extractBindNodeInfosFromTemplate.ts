import { IBindingNode } from './types';
import { createBindingNode } from './createBindingNode';
import { getBindTextByNodeType } from './getBindTextByNodeType';
import { getExpandableComments } from './getExpandableComments';
import { getNodeType } from './getNodeType';

const BIND_DATASET = "bind";
const SELECTOR = `[data-${BIND_DATASET}]`;

/**
 * HTMLテンプレートからバインドノード情報を抽出する
 * @param template テンプレート
 * @param useKeyed オプションのキーを使用するかどうかのフラグ
 * @returns {IBindingNode[]} バインドノード情報
 */
export function extractBindNodeInfosFromTemplate(
  template: HTMLTemplateElement, 
  useKeyed: boolean
): IBindingNode[] {
  const nodeInfos: IBindingNode[] = [];
  const rootElement = template.content;
  const nodes = (Array.from(rootElement.querySelectorAll(SELECTOR)) as Node[]).concat(getExpandableComments(rootElement));
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeType = getNodeType(node);
    const bindText = getBindTextByNodeType(node, nodeType);
    if (bindText.trim() === "") continue;
    nodeInfos[nodeInfos.length] = createBindingNode(nodes[i], nodeType, bindText, useKeyed);
  }
  return nodeInfos;
}
