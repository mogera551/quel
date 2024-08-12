import { IBindingManager } from "../@types/binding";
import { ParseBindTextInfo, PropertyCreators } from "./types";
import { Binding } from "../binding/Binding";

export const createBinding = (bindTextInfo:ParseBindTextInfo, propertyCreators:PropertyCreators) => 
  (bindingManager:IBindingManager, node:Node) => 
    Binding.create(
      bindingManager,
      node, bindTextInfo.nodeProperty, propertyCreators.nodePropertyCreator, 
      bindTextInfo.stateProperty, propertyCreators.statePropertyCreator, 
      bindTextInfo.filters
    );
