import "../types.js";
import BindDomIf from "./BindToDomIf.js";
import BindInfo from "./BindInfo.js";
import Perser from "./Parser.js";
import utils from "../utils.js";
import Thread from "../thread/Thread.js";
import { ProcessData } from "../thread/Processor.js";

const DATASET_BIND_PROPERTY = "bind";
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
 * 
 * @param {HTMLElement} element 
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : "value") : 
  DEFAULT_PROPERTY;
};

export default class extends BindDomIf {
  /**
   * 
   * @param {Node} node 
   * @param {ViewModel} viewModel
   * @param {string[]} indexes
   * @returns {BindInfo[]}
   */
  static bind(node, viewModel, indexes) {
    const element = toHTMLElement(node);
    const bindText = element.dataset[DATASET_BIND_PROPERTY];
    const defaultName = getDefaultProperty(element);

    // パース
    const binds = Perser
        .parse(bindText, defaultName)
        .map(info => {
          const bind = Object.assign(new BindInfo, info, {node, viewModel, indexes});
          bind.updateNode();
          return bind;
        });

    // イベントハンドラ設定
    let hasDefaultEvent = false;
    /**
     * @type {BindInfo}
     */
    let defaultBind = null;
    binds.forEach(bind => {
      hasDefaultEvent ||= bind.nodeProperty === DEFAULT_EVENT;
      defaultBind = (bind.nodeProperty === defaultName) ? bind : defaultBind;
      bind.isEvent && bind.addEventListener();
    });

    if (defaultBind && !hasDefaultEvent) {
      element.addEventListener(DEFAULT_EVENT_TYPE, (event) => {
        const process = new ProcessData(defaultBind.updateViewModel, defaultBind, []);
        Thread.current.addProcess(process);
        // defaultBind.updateViewModel();
        
      });
    }

    return binds;
  }

}