import { IBinding, IContentBindings, INodeProperty, IStateProperty } from "../binding/types";
import { IFilterText } from "../filter/types";

export type NodeType = "HTMLElement" | "SVGElement" | "Text" | "Template";

export type ParsedBindText = {
  nodeProperty: string; // ノードプロパティ名
  stateProperty: string; // ステートプロパティ名
  inputFilters: IFilterText[]; // 入力フィルタのテキスト情報リスト
  outputFilters: IFilterText[]; // 出力フィルタのテキスト情報リスト
}

// ノードプロパティ生成関数
export type NodePropertyCreator = (binding:IBinding, node:Node, name:string, filters:IFilterText[]) => INodeProperty;
// ステートプロパティ生成関数
export type StatePropertyCreator = (binding:IBinding, name:string, filters:IFilterText[]) => IStateProperty;

export type PropertyCreators = {
  nodePropertyCreator: NodePropertyCreator;
  statePropertyCreator: StatePropertyCreator;
}

// BINDテキストの解析結果
export type BindText = {
  createBinding: (contentBindings: IContentBindings, node: Node) => IBinding;
} & ParsedBindText & PropertyCreators;

export type NodeRoute = number[];

export type NodeRouteKey = string; // NodeRoute.join(",")

export interface IBindingNode {
  nodeType: NodeType; // ノードの種別
  nodeRoute: NodeRoute; // ノードのルート
  nodeRouteKey: NodeRouteKey; // ノードのルートキー
  bindTexts: BindText[]; // BINDテキストの解析結果
  acceptInput: boolean; // 入力可どうか？
  defaultProperty: string; // デフォルトプロパティ
  // ノード初期化（イベントハンドラ生成）
  initializeForNode(node:Node, bindings:IBinding[]):void; 
}

export interface IBinder {
  createBindings(content:DocumentFragment, contentBindings:IContentBindings):IBinding[];
}
