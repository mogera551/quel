import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";
import { ProcessData } from "../thread/ViewModelUpdator.js";
import { Event } from "../bindInfo/Event.js";
import { Radio } from "../bindInfo/Radio.js";
import { Checkbox } from "../bindInfo/Checkbox.js";

const DATASET_BIND_PROPERTY = "data-bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`not HTMLElement`);

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : "value") : 
  DEFAULT_PROPERTY;
};

/**
 * Eventクラスへ変換
 * @param {BindInfo} bind 
 * @returns {Event|undefined}
 */
const toEvent = bind => (bind instanceof Event) ? bind : undefined; 

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement);


export class BindToHTMLElement {
  /**
   * Bindを実行
   * @param {Node} node 
   * @param {Component} component
   * @param {ContextInfo} context
   * @returns {BindInfo[]}
   */
  static bind(node, component, context) {
    /** @type {ViewModel} */
    const viewModel = component.viewModel;
    /** @type {HTMLElement}  */
    const element = toHTMLElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY);
    /** @type {string} */
    const defaultName = getDefaultProperty(element);

    // パース
    /** @type {BindInfo[]} */
    const binds = BindToDom.parseBindText(node, component, viewModel, context, bindText, defaultName);
    binds.forEach(BindToDom.applyUpdateNode);

    // イベントハンドラ設定
    /** @type {boolean} デフォルトイベントを設定したかどうか */
    let hasDefaultEvent = false;

    /** @type {BindInfo|null} */
    let defaultBind = null;

    /** @type {Radio|null} */
    let radioBind = null;

    /** @type {Checkbox|null} */
    let checkboxBind = null;

    binds.forEach(bind => {
      hasDefaultEvent ||= bind.nodeProperty === DEFAULT_EVENT;
      radioBind = (bind instanceof Radio) ? bind : radioBind;
      checkboxBind = (bind instanceof Checkbox) ? bind : checkboxBind;
      defaultBind = (bind.nodeProperty === defaultName) ? bind : defaultBind;
      toEvent(bind)?.addEventListener();
    });

    /** @type {(bind:BindInfo)=>void} */
    const setDefaultEventHandler = (bind) => {
      const eventHandler = event => {
        event.stopPropagation();
        const process = new ProcessData(bind.updateViewModel, bind, []);
        component.updateSlot.addProcess(process);
      };
      element.addEventListener(DEFAULT_EVENT_TYPE, eventHandler);
      bind.defaultEventHandler = eventHandler;
      bind.defaultEventType = DEFAULT_EVENT_TYPE;
    }
    if (radioBind) {
      setDefaultEventHandler(radioBind);
    } else if (checkboxBind) {
      setDefaultEventHandler(checkboxBind);
    } else if (defaultBind && !hasDefaultEvent && isInputableElement(node)) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBind);
    }
    return binds;
  }
}
