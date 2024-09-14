import "jest";
import { removeDataBindAttribute } from '../../src/binder/removeDataBindAttribute';
import { NodeType } from '../../src/binder/types';

describe('removeDataBindAttribute', () => {
  it('should remove data-bind attribute from HTMLElement', () => {
    const element = document.createElement('div');
    element.setAttribute('data-bind', 'someValue');
    expect(element.getAttribute('data-bind')).toBe('someValue');

    const result = removeDataBindAttribute(element, "HTMLElement") as HTMLElement;
    expect(result.getAttribute('data-bind')).toBeNull();
  });

  it('should remove data-bind attribute from SVGElement', () => {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('data-bind', 'someValue');
    expect(svgElement.getAttribute('data-bind')).toBe('someValue');

    const result = removeDataBindAttribute(svgElement, "SVGElement") as SVGElement;
    expect(result.getAttribute('data-bind')).toBeNull();
  });

  it('should not modify Text nodes', () => {
    const textNode = document.createTextNode('some text');
    const result = removeDataBindAttribute(textNode, "Text");
    expect(result).toBe(textNode);
  });

  it('should not modify Template nodes', () => {
    const templateNode = document.createElement('template');
    const result = removeDataBindAttribute(templateNode, "Template");
    expect(result).toBe(templateNode);
  });
});