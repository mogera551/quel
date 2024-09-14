import 'jest';
import { getNodePropertyConstructor } from "../../src/binder/getNodePropertyConstructor";
import { NodeProperty } from "../../src/binding/nodeProperty/NodeProperty";
import { Branch } from "../../src/binding/nodeProperty/Branch";
import { ElementClassName } from "../../src/binding/nodeProperty/ElementClassName";
import { Checkbox } from "../../src/binding/nodeProperty/Checkbox";
import { Radio } from "../../src/binding/nodeProperty/Radio";
import { ElementEvent } from "../../src/binding/nodeProperty/ElementEvent";
import { ElementClass } from "../../src/binding/nodeProperty/ElementClass";
import { ElementAttribute } from "../../src/binding/nodeProperty/ElementAttribute";
import { ElementStyle } from "../../src/binding/nodeProperty/ElementStyle";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty";
import { ComponentProperty } from "../../src/binding/nodeProperty/ComponentProperty";
import { RepeatKeyed } from "../../src/binding/nodeProperty/RepeatKeyed";
import { Repeat } from "../../src/binding/nodeProperty/Repeat";
import { IBinding } from '../../src/binding/types';
import { IsComponentSymbol } from '../../src/component/symbols';

describe('getNodePropertyConstructor', () => {
  let mockNode: Node;
  let mockCommentNode: Comment;
  let mockElementNode: Element;
  let mockInputNode: HTMLInputElement;
  const binding = {} as IBinding;
//  const node = document.createElement('div');

  beforeEach(() => {
    mockNode = document.createTextNode('');
    mockCommentNode = document.createComment('');
    mockElementNode = document.createElement('div');
    mockInputNode = document.createElement('input');
  });

  it('should return Branch for comment node with propertyName "if"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockCommentNode, 'if', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockCommentNode, 'if', []);
    expect(nodeProperty.constructor).toBe(Branch);
  });

  it('should return ElementClassName for element node with propertyName "class"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'class', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'class', []);
    expect(nodeProperty.constructor).toBe(ElementClassName);
  });

  it('should return Checkbox for element node with propertyName "checkbox"', () => {
    mockInputNode.type = "checkbox";
    const createNodeProperty = getNodePropertyConstructor(mockInputNode, 'checkbox', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockInputNode, 'checkbox', []);
    expect(nodeProperty.constructor).toBe(Checkbox);
  });

  it('should return Radio for element node with propertyName "radio"', () => {
    mockInputNode.type = "radio";
    const createNodeProperty = getNodePropertyConstructor(mockInputNode, 'radio', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockInputNode, 'radio', []);
    expect(nodeProperty.constructor).toBe(Radio);
  });

  it('should return Repeat for comment node with propertyName "loop"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockCommentNode, 'loop', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockCommentNode, 'loop', []);
    expect(nodeProperty.constructor).toBe(Repeat);
  });

  it('should return RepeatKeyed for comment node with propertyName "loop"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockCommentNode, 'loop', true);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockCommentNode, 'loop', []);
    expect(nodeProperty.constructor).toBe(RepeatKeyed);
  });

  it('should throw for comment node with unknown propertyName', () => {
    expect(() => {
      const createNodeProperty = getNodePropertyConstructor(mockCommentNode, 'unknown', true);
    }).toThrow('NodePropertyCreateor: unknown node property unknown');
  });

  it('should return ElementClass for element node with propertyName "class.name"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'class.name', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'class.name', []);
    expect(nodeProperty.constructor).toBe(ElementClass);
  });

  it('should return ElementAttribute for element node with propertyName "attr.name"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'attr.name', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'attr.name', []);
    expect(nodeProperty.constructor).toBe(ElementAttribute);
  });

  it('should return ElementStyle for element node with propertyName "style"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'style.name', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'style.name', []);
    expect(nodeProperty.constructor).toBe(ElementStyle);
  });

  it('should return ComponentProperty for element node with propertyName "props.name"', () => {
    Object.defineProperty(mockElementNode, IsComponentSymbol, { value:true });
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'props.name', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'props.name', []);
    expect(nodeProperty.constructor).toBe(ComponentProperty);
  });

  it('should return ElementEvent for element node with propertyName "onclick"', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'onclick', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'onclick', []);
    expect(nodeProperty.constructor).toBe(ElementEvent);
  });

  it('should return ElementProperty for element node with unknown propertyName', () => {
    const createNodeProperty = getNodePropertyConstructor(mockElementNode, 'unknown', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockElementNode, 'unknown', []);
    expect(nodeProperty.constructor).toBe(ElementProperty);
  });

  it('should return NodeProperty for text node with unknown propertyName', () => {
    const createNodeProperty = getNodePropertyConstructor(mockNode, 'unknown', false);
    expect(createNodeProperty).toBeInstanceOf(Function);
    const nodeProperty = createNodeProperty(binding, mockNode, 'unknown', []);
    expect(nodeProperty.constructor).toBe(NodeProperty);
  });
});