import { ParsedBindText, PropertyConstructors } from "./types";
import { createBinding } from "../binding/Binding";
import { IBinding, IContentBindings } from "../binding/types";

/**
 * バインディング情報を元にバインディングを作成する関数を返す
 */
export const getCreateBinding = 
(bindTextInfo: ParsedBindText, propertyCreators: PropertyConstructors) => 
(contentBindings: IContentBindings, node: Node): IBinding => 
  createBinding(
    contentBindings,
    node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyConstructor, 
    bindTextInfo.inputFilters,
    bindTextInfo.stateProperty, propertyCreators.statePropertyConstructor, 
    bindTextInfo.outputFilters
  );
