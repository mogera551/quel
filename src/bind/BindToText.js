import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo from "../bindInfo/BindInfo.js";
import Perser from "./Parser.js";
import utils from "../utils.js";
import Thread from "../thread/Thread.js";
import Factory from "../bindInfo/Factory.js";

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise("not Comment");

export default class extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {ViewModel} viewModel
   * @param {string[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, viewModel, indexes) {
    // コメントノードをテキストノードに差し替える
    const comment = toComment(node);
    const bindText = comment.textContent.slice(2); // @@をスキップ
    const textNode = document.createTextNode("");
    comment.parentNode.replaceChild(textNode, comment);
    // パース
    const binds = Perser
      .parse(bindText, DEFAULT_PROPERTY)
      .map(info => {
        const bind = Factory.create(Object.assign(info, {node:textNode, viewModel, indexes}));
        bind.updateNode();
        return bind;
      });
    return binds;
  }

}