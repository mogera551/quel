import { ParseBindTextInfo, PropertyCreators } from "./types";
import { createBinding as create } from "../newBinding/Binding";
import { IContentBindings } from "../newBinding/types";

export const createBinding = 
(bindTextInfo: ParseBindTextInfo, propertyCreators: PropertyCreators) => 
(contentBindings: IContentBindings, node: Node) => 
  create(
    contentBindings,
    node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, 
    bindTextInfo.inputFilters,
    bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, 
    bindTextInfo.outputFilters
  );
