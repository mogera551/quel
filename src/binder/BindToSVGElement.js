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
   * 
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    const viewModel = component.viewModel;
    const element = toSVGElement(node);
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY);
    const defaultName = undefined;

    // パース
    const binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    /**
     * @type {BindInfo}
     */
    binds.forEach(bind => {
      toEvent(bind)?.addEventListener();
    });

    return binds;
  }

}