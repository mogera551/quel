
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
  get component(): IComponent;
}

export interface IContentBindings {
  template: string;
  listBindings: IBinding[];
  parentBinding?: IBinding;
  loopContext: ILoopContext;
  component: IComponent;

}