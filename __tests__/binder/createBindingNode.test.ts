import "jest";
import { createBindingNode } from '../../src/binder/createBindingNode';
import { NodeType } from '../../src/binder/types';
import { JSDOM } from 'jsdom';
import { getByUUID } from "../../src/component/Template";

jest.mock("../../src/component/Template");

describe('createBindingNode', () => {
  //let dom: JSDOM;
  //let document: Document;
  let parentNode: HTMLElement;
  
  beforeEach(() => {
    //dom = new JSDOM('<!DOCTYPE html><p>Hello world</p>');
    //document = dom.window.document;
    parentNode = document.createElement('div');
    
  });

  it('should create a binding node with correct properties', () => {
    const node = document.createElement('div');
    parentNode.appendChild(node);
    const bindText = 'text: someProperty';
    node.setAttribute('data-bind', bindText);
    const nodeType = "HTMLElement";
    const useKeyed = false;

    const bindingNode = createBindingNode(node, nodeType, bindText, useKeyed);

    expect(bindingNode.nodeType).toBe(nodeType);
    expect(bindingNode.nodeRoute).toBeDefined();
    expect(bindingNode.nodeRouteKey).toBeDefined();
    expect(bindingNode.bindTexts.length).toBeGreaterThan(0);
    expect(bindingNode.acceptInput).toBe(false);
    expect(bindingNode.defaultProperty).toBe('textContent');
    expect(node.hasAttribute('data-bind')).toBe(false);
  });

  it('should handle nodes that can accept input', () => {
    const node = document.createElement('input');
    parentNode.appendChild(node);
    const bindText = 'value: someProperty';
    node.setAttribute('data-bind', bindText);
    const nodeType = "HTMLElement";
    const useKeyed = false;

    const bindingNode = createBindingNode(node, nodeType, bindText, useKeyed);

    expect(bindingNode.acceptInput).toBe(true);
    expect(bindingNode.defaultProperty).toBe('value');
  });

  it('should replace comment nodes with text nodes', () => {
    const commentNode = document.createComment('@@:someProperty');
    parentNode.appendChild(commentNode);
    const nodeType = "Text";
    const bindText = 'someProperty';
    const useKeyed = false;

    const bindingNode = createBindingNode(commentNode, nodeType, bindText, useKeyed);

    expect(bindingNode.nodeType).toBe(nodeType);
    expect(bindingNode.nodeRoute).toBeDefined();
    expect(bindingNode.nodeRouteKey).toBeDefined();
    expect(bindingNode.bindTexts.length).toBeGreaterThan(0);
    expect(bindingNode.acceptInput).toBe(false);
    expect(bindingNode.defaultProperty).toBe('textContent');
    expect(parentNode.contains(commentNode)).toBe(false);
  });

  it('should handle Template nodes', () => {
    const template = document.createElement('template') as HTMLTemplateElement;
    template.dataset.bind = 'if:someProperty';
    (getByUUID as jest.Mock).mockReturnValue(template);
    const node = document.createComment('@@:sample comment');
    parentNode.appendChild(node);
    const nodeType = "Template";
    const bindText = 'if:someProperty';
    const useKeyed = false;

    const bindingNode = createBindingNode(template, nodeType, bindText, useKeyed);

    expect(bindingNode.nodeType).toBe(nodeType);
    expect(bindingNode.nodeRoute).toBeDefined();
    expect(bindingNode.nodeRouteKey).toBeDefined();
    expect(bindingNode.bindTexts.length).toBeGreaterThan(0);
    expect(bindingNode.acceptInput).toBe(false);
    expect(bindingNode.defaultProperty).toBe("");
  });

  it('should handle SVGElement nodes', () => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('data-bind', 'someProperty');
    parentNode.appendChild(svgElement);
    const nodeType = "SVGElement";
    const bindText = 'someProperty';
    const useKeyed = false;

    const bindingNode = createBindingNode(svgElement, nodeType, bindText, useKeyed);

    expect(bindingNode.nodeType).toBe(nodeType);
    expect(bindingNode.nodeRoute).toBeDefined();
    expect(bindingNode.nodeRouteKey).toBeDefined();
    expect(bindingNode.bindTexts.length).toBeGreaterThan(0);
    expect(bindingNode.acceptInput).toBe(false);
    expect(bindingNode.defaultProperty).toBe("");
    expect(svgElement.hasAttribute('data-bind')).toBe(false);
  });


});