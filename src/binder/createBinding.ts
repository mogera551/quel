import { ParseBindTextInfo, PropertyCreators } from "../@types/binder";
import { createBinding as create } from "../binding/Binding";
import { IContentBindings } from "../@types/binding";

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
