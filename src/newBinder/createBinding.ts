import { IBindingManager } from "../binding/types";
import { Binding } from "../binding/Binding";
import { ParseBindTextInfo, PropertyCreators } from "./types";

export const createBinding = (bindTextInfo:ParseBindTextInfo, propertyCreators:PropertyCreators) => 
  (bindingManager:IBindingManager, node:Node) => 
    Binding.create(
      bindingManager,
      node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, 
      bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, 
      bindTextInfo.filters
    );
