import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { Event } from "../bindInfo/Event.js";
import { Radio } from "../bindInfo/Radio.js";
import { Checkbox } from "../bindInfo/Checkbox.js";

const DATASET_BIND_PROPERTY = "bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY = "textContent";

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
    const bindText = element.dataset[DATASET_BIND_PROPERTY];
    const defaultName = undefined;

    // パース
    const parseBindText = BindToDom.parseBindText(node, component, viewModel, context);
    const binds = parseBindText(bindText, defaultName);
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