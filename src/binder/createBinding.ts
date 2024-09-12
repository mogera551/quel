import { ParsedBindText, PropertyCreators } from "./types";
import { createBinding } from "../binding/Binding";
import { IBinding, IContentBindings } from "../binding/types";

/**
 * バインディング情報を元にバインディングを作成する関数を返す
 */
export const createBindingWithBindInfo = 
(bindTextInfo: ParsedBindText, propertyCreators: PropertyCreators) => 
(contentBindings: IContentBindings, node: Node): IBinding => 
  createBinding(
    contentBindings,
    node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, 
    bindTextInfo.inputFilters,
    bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, 
    bindTextInfo.outputFilters
  );
