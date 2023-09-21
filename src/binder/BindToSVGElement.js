import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";
import { Event } from "../bindInfo/Event.js";

const DATASET_BIND_PROPERTY = "data-bind";

/**
 * 
 * @param {Node} node 
 * @returns {SVGElement}
 */
const toSVGElement = node => (node instanceof SVGElement) ? node : utils.raise(`not SVGElement`);

/**
 * 
 * @param {BindInfo} bind 
 * @returns {Event|undefined}
 */
const toEvent = bind => (bind instanceof Event) ? bind : undefined; 

export class BindToSVGElement {
  /**
   * バインドを実行する
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {SVGElement} */
    const element = toSVGElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY);
    /** @type {string|undefined} */
    const defaultName = undefined;

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    binds.forEach(bind => {
      toEvent(bind)?.addEventListener();
    });

    return binds;
  }

}