import "jest";
import { getBindTextByNodeType } from '../../src/binder/getBindTextByNodeType';
import { getByUUID } from "../../src/component/Template";

jest.mock("../../src/component/Template");

describe('getBindTextByNodeType', () => {
  test('should return correct text for node type "text"', () => {
    const node = document.createElement('div');
    node.dataset.bind = 'sample text'
    const result = getBindTextByNodeType(node, 'HTMLElement');
    expect(result).toBe('sample text');
  });
  test('should return empty text for node type "text"', () => {
    const node = document.createElement('div');
    const result = getBindTextByNodeType(node, 'HTMLElement');
    expect(result).toBe('');
  });

  test('should return correct text for node type "svg"', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    node.dataset.bind = 'sample svg'
    const result = getBindTextByNodeType(node, 'SVGElement');
    expect(result).toBe('sample svg');
  });
  test('should return empty text for node type "svg"', () => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const result = getBindTextByNodeType(node, 'SVGElement');
    expect(result).toBe('');
  });

  test('should return correct text for node type "Text"', () => {
    const node = document.createTextNode('@@:sample text');
    const result = getBindTextByNodeType(node, 'Text');
    expect(result).toBe('sample text');
  });
  test('should return empty text for node type "Text"', () => {
    const node = document;
    const result = getBindTextByNodeType(node, 'Text');
    expect(result).toBe('');
  });

  test('should return correct text for node type "Template"', () => {
    const template = document.createElement('template') as HTMLTemplateElement;
    template.dataset.bind = 'sample template';
    (getByUUID as jest.Mock).mockReturnValue(template);
    const node = document.createComment('@@:sample comment');
    const result = getBindTextByNodeType(node, 'Template');
    expect(result).toBe('sample template');
  });
  test('should return empty text for node type "Template"', () => {
    (getByUUID as jest.Mock).mockReturnValue(undefined);
    const node = document.createComment('@@:sample comment');
    const result = getBindTextByNodeType(node, 'Template');
    expect(result).toBe('');
  });
  test('should return empty text for node type "Template"', () => {
    const node = document;
    const result = getBindTextByNodeType(node, 'Template');
    expect(result).toBe('');
  });

});