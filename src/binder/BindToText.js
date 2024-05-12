import "../types.js";
import { utils } from "../utils.js";
import * as BindToDom from "./BindToDom.js";

const moduleName = "BindToText";

const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {Comment}
 */
const toComment = node => (node instanceof Comment) ? node : utils.raise(`${moduleName}: not Comment`);

/**
 * バインドを実行する（ノードがComment（TextNodeの置換）の場合）
 * Commentノードをテキストノードに置換する
 * @param {import("../binding/Binding.js").BindingManager} bindingManager
 * @param {Node} node 
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function bind(bindingManager, node) {
  // コメントノードをテキストノードに差し替える
  /** @type {ViewModel} */
  const viewModel = bindingManager.component.viewModel;
  /** @type {Comment} */
  const comment = toComment(node);
  const parentNode = comment.parentNode ?? undefined;
  (typeof parentNode === "undefined") && utils.raise(`${moduleName}: no parent`);
  /** @type {string} */
  const bindText = comment.textContent.slice(3); // @@:をスキップ
  if (bindText.trim() === "") return [];
  /** @type {Text} */
  const textNode = document.createTextNode("");
  parentNode.replaceChild(textNode, comment);

  // パース
  /** @type {import("../binding/Binding.js").Binding[]} */
  const bindings = BindToDom.parseBindText(bindingManager, textNode, viewModel, bindText, DEFAULT_PROPERTY);

  return bindings;
}
