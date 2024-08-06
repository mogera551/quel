import { Binding, BindingManager } from "../binding/Binding";
import { ParseBindTextInfo, Constructors } from "./types";

export const createBinding = (bindTextInfo:ParseBindTextInfo, constructors:Constructors) => (bindingManager:BindingManager, node:Node) => Binding.create(
  bindingManager,
  node, bindTextInfo.nodeProperty, constructors.nodePropertyConstructor, 
  bindTextInfo.stateProperty, constructors.statePropertyConstructor, 
  bindTextInfo.filters
);
