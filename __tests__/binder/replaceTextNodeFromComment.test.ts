import "jest";
import { replaceTextNodeFromComment } from '../../src/binder/replaceTextNodeFromComment';
import { NodeType } from '../../src/binder/types';

describe('replaceTextNodeFromComment', () => {
  let commentNode: Comment;
  let textNode: Text;
  let divElement: HTMLElement;
  let svgElement: SVGElement;
  let templateElement: HTMLTemplateElement;

  beforeEach(() => {
    commentNode = document.createComment('This is a comment');
    textNode = document.createTextNode('This is a text node');
    divElement = document.createElement('div');
    svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    templateElement = document.createElement('template');
  });

  it('should replace a comment node with a text node', () => {
    document.body.appendChild(commentNode);
    const result = replaceTextNodeFromComment(commentNode, "Text") as Text;
    expect(result.nodeType).toBe(Node.TEXT_NODE);
    expect(result.textContent).toBe('');
    expect(document.body.contains(commentNode)).toBe(false);
    expect(document.body.contains(result)).toBe(true);
  });

  it('should return the same HTMLElement node', () => {
    const result = replaceTextNodeFromComment(divElement, "HTMLElement");
    expect(result).toBe(divElement);
  });

  it('should return the same SVGElement node', () => {
    const result = replaceTextNodeFromComment(svgElement, "SVGElement");
    expect(result).toBe(svgElement);
  });

  it('should return the same Template node', () => {
    const result = replaceTextNodeFromComment(templateElement, "Template");
    expect(result).toBe(templateElement);
  });
});