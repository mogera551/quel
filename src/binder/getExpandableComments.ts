/**
 * "@@:"もしくは"@@|"で始まるコメントノードを取得する
 */
const isCommentNode = (node:Node):boolean => node instanceof Comment && ((node.textContent?.startsWith("@@:") ?? false) || (node.textContent?.startsWith("@@|") ?? false));

/**
 * ノードツリーからexpandableなコメントノードを取得する
 * expandableなコメントノードとは、"@@:"もしくは"@@|"で始まるコメントノードのこと
 * {{ if: }}や{{ loop: }}を置き換えたもの指すためのコメントノード
 */
export function getExpandableComments(
  node:Node
):Comment[] {
  return Array.from(node.childNodes).flatMap(node => getExpandableComments(node).concat(isCommentNode(node as Node) ? node as Comment : []));
}
