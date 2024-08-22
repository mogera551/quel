
import "../nop";

export interface INodeProperty {
  node: Node;
  name: string;
  binding: IBinding;
}

export interface IStateProperty {
  state: IState;
  name: string;
  binding: IBinding;
}

export interface IBinding {
  nodeProperty: INodeProperty;
  stateProeprty: IStateProperty;
  listContentBindings: IContentBindings[];
  parentContentBindings: IContentBindings;
  loopable: boolean;
  get component(): IComponent;
}

export interface IContentBindings {
  template: HTMLTemplateElement;
  listBinding: IBinding[];
  parentBinding?: IBinding;
  get loopContext(): ILoopContext;
  get component(): IComponent;

}