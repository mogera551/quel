
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
  id: string;
  nodeProperty: INewNodeProperty;
  stateProeprty: INewStateProperty;
  childrenContentBindings: IContentBindings[];
  parentContentBindings: IContentBindings;
  loopable: boolean;
  component: IComponent;
  appendChildContentBindings(contentBindings: IContentBindings): void;
  removeAllChildrenContentBindings(): IContentBindings[];
  dispose(): void;
}

export interface IContentBindings {
  template: HTMLTemplateElement;
  childrenBinding: INewBinding[];
  parentBinding?: INewBinding;
  loopContext: INewLoopContext | undefined;
  currentLoopContext: INewLoopContext | undefined;
  component: IComponent;
  parentContentBindings: IContentBindings | undefined;

  fragment: DocumentFragment;
  childNodes: Node[];

  initialize():void;
  applyToNode():void;
  dispose():void;
}

export interface IMultiValue {
  value:any;
  enabled:boolean;
}
