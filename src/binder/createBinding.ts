import { ParsedBindTextInfo, PropertyCreators } from "./types";
import { createBinding } from "../binding/Binding";
import { IContentBindings } from "../binding/types";

export const createBindingWithBindInfo = 
(bindTextInfo: ParsedBindTextInfo, propertyCreators: PropertyCreators) => 
(contentBindings: IContentBindings, node: Node) => 
  createBinding(
    contentBindings,
    node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, 
    bindTextInfo.inputFilters,
    bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, 
    bindTextInfo.outputFilters
  );
