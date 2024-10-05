import { NodeType, IBindingNode } from "./types";
import { Checkbox } from "../binding/nodeProperty/Checkbox";
import { Radio } from "../binding/nodeProperty/Radio";
import { IBinding } from "../binding/types";

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";

const setDefaultEventHandlerByElement = 
(element:HTMLElement) => 
  (binding:Pick<IBinding, "defaultEventHandler">) => 
    element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);

function initializeHTMLElement(
  node: Node, 
  acceptInput: boolean, 
  bindings: Pick<IBinding, "defaultEventHandler"|"nodeProperty">[], 
  defaultName: string
): void {
  const element = node as HTMLElement;

  // set event handler
  let hasDefaultEvent = false;

  let defaultBinding:(Pick<IBinding, "defaultEventHandler">|null) = null;

  let radioBinding:(Pick<IBinding, "defaultEventHandler">|null) = null;

  let checkboxBinding:(Pick<IBinding, "defaultEventHandler">|null) = null;

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
    } else if (defaultBinding && acceptInput) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
  }
}

const thru = () => {};

type InitializeNodeByNodeType = {
  [key in NodeType]: (
    node: Node, 
    acceptInput: boolean, 
    bindings: Pick<IBinding, "defaultEventHandler"|"nodeProperty">[], 
    defaultName:string
  ) => void;
}

const initializeNodeByNodeType:InitializeNodeByNodeType = {
  HTMLElement: initializeHTMLElement,
  SVGElement:  thru,
  Text:        thru,
  Template:    thru,
};

/**
 * ノードの初期化処理
 * 入力可のノードの場合、デフォルトイベントハンドラを設定する
 * @param nodeInfo ノード情報
 * @returns {function} ノードの初期化処理
 */
export const initializeForNode = 
(
  nodeInfo: Pick<IBindingNode, "nodeType"|"acceptInput"|"defaultProperty">,
) => 
  (
    node: Node, 
    bindings: Pick<IBinding, "defaultEventHandler"|"nodeProperty">[]
  ) => initializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.acceptInput, bindings, nodeInfo.defaultProperty);
