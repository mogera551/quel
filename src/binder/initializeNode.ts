import { NodeType, IBindNodeInfo } from "./types";
import { Checkbox } from "../binding/nodeProperty/Checkbox";
import { Radio } from "../binding/nodeProperty/Radio";
import { IBinding } from "../binding/types";

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";

const setDefaultEventHandlerByElement = (element:HTMLElement) => (binding:IBinding) => 
  element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);

function initializeHTMLElement(node:Node, isInputable:boolean, bindings:IBinding[], defaultName:string) {
  const element = node as HTMLElement;

  // set event handler
  let hasDefaultEvent = false;

  let defaultBinding:(IBinding|null) = null;

  let radioBinding:(IBinding|null) = null;

  let checkboxBinding:(IBinding|null) = null;

  for(let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
    radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
    checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
    defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
  }

  if (!hasDefaultEvent) {
    const setDefaultEventHandler = setDefaultEventHandlerByElement(element);

    if (radioBinding) {
      setDefaultEventHandler(radioBinding);
    } else if (checkboxBinding) {
      setDefaultEventHandler(checkboxBinding);
    } else if (defaultBinding && isInputable) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
  }
  return undefined;
}

const thru = () => {};

type InitializeNodeByNodeType = {
  [key in NodeType]: (node:Node, isInputable:boolean, bindings:IBinding[], defaultName:string)=>void;
}

const initializeNodeByNodeType:InitializeNodeByNodeType = {
  HTMLElement: initializeHTMLElement,
  SVGElement:  thru,
  Text:        thru,
  Template:    thru,
};

export const initializeNode = (nodeInfo:IBindNodeInfo) => (node:Node, bindings:IBinding[]) => initializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.isInputable, bindings, nodeInfo.defaultProperty);
