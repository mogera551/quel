
import { INewLoopContext } from "../newLoopContext/types";
import "../nop";

export interface INewNodeProperty {
  node: Node;
  name: string;
  binding: INewBinding;
}

export interface INewStateProperty {
  state: IState;
  name: string;
  binding: INewBinding;
}

export interface INewBinding {
  nodeProperty: INewNodeProperty;
  stateProeprty: INewStateProperty;
  childrenContentBindings: IContentBindings[];
  parentContentBindings: IContentBindings;
  loopable: boolean;
  get component(): IComponent;
}

export interface IContentBindings {
  template: HTMLTemplateElement;
  childrenBinding: INewBinding[];
  parentBinding?: INewBinding;
  loopContext: INewLoopContext | undefined;
  currentLoopContext: INewLoopContext | undefined;
  component: IComponent;
  parentContentBindings: IContentBindings | undefined;

}