/**
 * is the node a comment node for template or text ?
 */
const isCommentNode = (node:Node):boolean => node instanceof Comment && ((node.textContent?.startsWith("@@:") ?? false) || (node.textContent?.startsWith("@@|") ?? false));

/**
 * get comment nodes for template or text
 */
export const getCommentNodes = (node:Node):Comment[] => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node as Node) ? node as Comment : []));
