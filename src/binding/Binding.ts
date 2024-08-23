import { utils } from "../utils";
import { INodeProperty, IStateProperty, IBinding, IBindingManager } from "../@types/binding";
import { NodePropertyCreator, StatePropertyCreator } from "../@types/binder";
import { IFilterInfo } from "../@types/filter";
import { ILoopContext } from "../@types/loopContext";
import { IComponent } from "../@types/component";
import { LoopContext } from "../loopContext/LoopContext";
import { Binder } from "../binder/Binder";
import { Popover } from "../popover/Popover";

let seq = 0;

export class Binding implements IBinding {
  #id:number = -1;
  get id() {
    return this.#id;
  }

  #bindingManager:IBindingManager; // parent binding manager
  get bindingManager() {
    return this.#bindingManager;
  }

  #nodeProperty:INodeProperty;
  get nodeProperty() {
    return this.#nodeProperty;
  }

  #stateProperty:IStateProperty;
  get stateProperty() {
    return this.#stateProperty;
  }

  // todo: componentの型を指定する
  get component():any {
    return this.#bindingManager.component;
  }

  // todo: loopContextの型を指定する
  // new loop context
  get loopContext():any {
    return this.#bindingManager.loopContext;
  }

  /** child bindingManager for branch/repeat */
  #children:IBindingManager[] = [];
  get children() {
    return this.#children;
  }

  // branch/repeat is true
  get expandable():boolean {
    return this.nodeProperty.expandable;
  }

  // repeat is true
  get loopable():boolean {
    return this.nodeProperty.loopable;
  }

  /** for select tag value */
  #isSelectValue:(boolean|undefined);
  get isSelectValue():boolean {
    if (typeof this.#isSelectValue === "undefined") {
      this.#isSelectValue = this.nodeProperty.isSelectValue;
    }
    return this.#isSelectValue;
  }

  constructor(
    bindingManager:IBindingManager,
    node:Node, 
    nodePropertyName:string, 
    nodePropertyCreator:NodePropertyCreator, 
    statePropertyName:string, 
    statePropertyCreator:StatePropertyCreator,
    filters:IFilterInfo[]
  ) {
    // assignを呼ぶとbindingManagerなどがundefinedになるので、constructorで初期化
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, filters);
    this.#stateProperty = statePropertyCreator(this, statePropertyName, filters);
  }

  /**
   * for reuse
   */
  assign(bindingManager:IBindingManager, 
    node:Node, nodePropertyName:string, nodePropertyCreator:NodePropertyCreator, 
    statePropertyName:string, statePropertyConstructor:StatePropertyCreator, filters:IFilterInfo[]):IBinding {
    this.#id = ++seq;
    this.#bindingManager = bindingManager;
    this.#nodeProperty = nodePropertyCreator(this, node, nodePropertyName, filters);
    this.#stateProperty = statePropertyConstructor(this, statePropertyName, filters);
    return this;
  }

  /**
   * apply value to node
   */
  applyToNode() {
    const { component, nodeProperty, stateProperty } = this
    component.updator.applyNodeUpdatesByBinding(this, () => {
      if (!nodeProperty.applicable) return;
      const filteredStateValue = stateProperty.filteredValue ?? "";
      if (nodeProperty.isSameValue(filteredStateValue)) return;
      nodeProperty.value = filteredStateValue;
    });
  }

  /**
   * apply value to child nodes
   */
  applyToChildNodes(setOfIndex:Set<number>) {
    const { component } = this;
    component.updator.applyNodeUpdatesByBinding(this, () => {
      this.nodeProperty.applyToChildNodes(setOfIndex);
    });
  }

  /**
   * apply value to State
   */
  applyToState() {
    const { stateProperty, nodeProperty } = this;
    if (!stateProperty.applicable) return;
    stateProperty.value = nodeProperty.filteredValue;
  }

  /**
   */
  execDefaultEventHandler(event:Event) {
    if (!(this.component?.bindingSummary.exists(this) ?? false)) return;
    event.stopPropagation();
    this.component.updator.addProcess(this.applyToState, this, []);
  }

  #defaultEventHandler:(((event:Event)=>void)|undefined) = undefined;
  get defaultEventHandler():((event:Event)=>void) {
    if (typeof this.#defaultEventHandler === "undefined") {
      this.#defaultEventHandler = (binding => event => binding.execDefaultEventHandler(event))(this);
    }
    return this.#defaultEventHandler;
  }

  /**
   * initialize
   */
  initialize() {
    this.nodeProperty.initialize();
    this.stateProperty.initialize();
  }

  /**
   */
  appendChild(bindingManager:IBindingManager) {
    if (!this.expandable) utils.raise("Binding.appendChild: not expandable");
    const lastChild:IBindingManager = this.children[this.children.length - 1];
    this.children.push(bindingManager);
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode:Node = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  /**
   */
  replaceChild(index:number, bindingManager:IBindingManager) {
    if (!this.expandable) utils.raise("Binding.replaceChild: not expandable");
    const lastChild = this.children[index - 1];
    this.children[index] = bindingManager;
    const parentNode = this.nodeProperty.node.parentNode;
    const beforeNode = lastChild?.lastNode ?? this.nodeProperty.node;
    parentNode?.insertBefore(bindingManager.fragment, beforeNode.nextSibling ?? null);
  }

  dispose() {
    for(let i = 0; i < this.children.length; i++) {
      this.children[i].dispose();
    }
    this.children.length = 0;
    this.nodeProperty.dispose();
    this.stateProperty.dispose();
    this.component.bindingSummary.delete(this);
  }

  /**
   * create Binding
   */
  static create(bindingManager:IBindingManager,
    node:Node, nodePropertyName:string, nodePropertyCreator:NodePropertyCreator, 
    statePropertyName:string, statePropertyCreator:StatePropertyCreator, filters:IFilterInfo[]) 
  {
    const binding = Reflect.construct(Binding, [bindingManager,
        node, nodePropertyName, nodePropertyCreator, 
        statePropertyName, statePropertyCreator,
        filters]);
    binding.initialize();
    return binding;
  }
}

const filterElement = (node:Node):boolean => node.nodeType === Node.ELEMENT_NODE;

export class BindingManager implements IBindingManager {
  // todo: componentの型を指定する
  #component:any;
  get component():any {
    return this.#component;
  }

  #bindings:IBinding[] = [];
  get bindings():IBinding[] {
    return this.#bindings;
  }

  #nodes:Node[] = [];
  get nodes():Node[] {
    return this.#nodes ?? [];
  }

  get elements():Element[] {
    return this.nodes.filter(filterElement) as Element[];
  }

  get lastNode():Node {
    return this.nodes[this.nodes.length - 1];
  }

  #fragment:DocumentFragment = document.createDocumentFragment();
  get fragment():DocumentFragment {
    return this.#fragment;
  }
  set fragment(value:DocumentFragment) {
    this.#fragment = value;
  }

  #loopContext:ILoopContext;
  get loopContext():ILoopContext {
    return this.#loopContext;
  }

  #template:HTMLTemplateElement;
  get template():HTMLTemplateElement {
    return this.#template;
  }

  #parentBinding:(IBinding|undefined);
  get parentBinding():(IBinding|undefined) {
    return this.#parentBinding;
  }
  set parentBinding(value:(IBinding|undefined)) {
    this.#parentBinding = value;
  }

  // todo: BindingSummaryの型を指定する
  #bindingSummary:any;

  #uuid:string;
  get uuid():string {
    return this.#uuid;
  }

  constructor(component:any, template:HTMLTemplateElement, uuid:string, parentBinding:(IBinding|undefined)) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
    this.#bindingSummary = component.bindingSummary;
    this.#uuid = uuid;

    return this;

    this.assign(component, template, uuid, parentBinding);
  }

  /**
   * for reuse
   */
  assign(component:any, template:HTMLTemplateElement, uuid:string, parentBinding:(IBinding|undefined)) {
    this.#parentBinding = parentBinding;
    this.#component = component;
    this.#template = template;
    this.#loopContext = new LoopContext(this);
    this.#bindingSummary = component.bindingSummary;
    this.#uuid = uuid;

    return this;
  }

  /**
   * 
   */
  initialize() {
    const binder = Binder.create(this.#template, this.#component.useKeyed);
    this.#fragment = document.importNode(this.#template.content, true); // See http://var.blog.jp/archives/76177033.html
    this.#bindings = binder.createBindings(this.#fragment, this);
    this.#nodes = Array.from(this.#fragment.childNodes);
  }

  /**
   * register bindings to summary
   */
  registerBindingsToSummary() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#bindingSummary.add(this.#bindings[i]);
    }
  }

  postCreate() {
    this.registerBindingsToSummary();
    this.applyToNode();
  }

  /**
   * apply value to node
   */
  applyToNode() {
    // apply value to node exluding select tag, and apply select tag value
    const selectBindings = [];
    for(let i = 0; i < this.#bindings.length; i++) {
      const binding = this.#bindings[i];
      if (binding.isSelectValue) {
        selectBindings.push(binding);
      } else {
        binding.applyToNode();
      }
    }
    for(let i = 0; i < selectBindings.length; i++) {
      selectBindings[i].applyToNode();
    }
  }

  /**
   * apply value to State
   */
  applyToState() {
    for(let i = 0; i < this.#bindings.length; i++) {
      this.#bindings[i].applyToState();
    }
  }

  /**
   * remove nodes, append to fragment
   */
  removeNodes() {
    for(let i = 0; i < this.#nodes.length; i++) {
      this.#fragment?.appendChild(this.#nodes[i]);
    }
  }

  /**
   * 
   */
  dispose() {
    this.removeNodes(); // append nodes to fragment
    for(let i = 0; i < this.bindings.length; i++) {
      this.bindings[i].dispose();
    }
    const uuid = this.#uuid;
    this.#parentBinding = undefined;
    this.#component = undefined;
    this.#bindingSummary = undefined;

    BindingManager._cache[uuid]?.push(this) ??
      (BindingManager._cache[uuid] = [this]);
  }

  static _cache:BindingManagerByUUID = {};

  /**
   * create BindingManager
   */
  static create(component:IComponent, template:HTMLTemplateElement, uuid:string, parentBinding?:IBinding):IBindingManager {
    let bindingManager = this._cache[uuid]?.pop()?.assign(component, template, uuid, parentBinding);
    if (typeof bindingManager === "undefined") {
      bindingManager = new BindingManager(component, template, uuid, parentBinding);
      bindingManager.initialize();
    }
    Popover.initialize(bindingManager);
    return bindingManager;
  }

}

type BindingManagerByUUID = {[key:string]:IBindingManager[]};