import "jest";
import { extractBindNodeInfosFromTemplate } from '../../src/binder/extractBindNodeInfosFromTemplate';
import { IBindingNode } from '../../src/binder/types';
import { BindingNode } from '../../src/binder/BindingNode';
import { getByUUID } from "../../src/component/Template";

jest.mock("../../src/component/Template");

describe('extractBindNodeInfosFromTemplate', () => {
  let template: HTMLTemplateElement;

  beforeEach(() => {
    template = document.createElement('template');
  });

  it('should return an empty array if there are no bind nodes', () => {
    template.innerHTML = '<div></div>';
    const result = extractBindNodeInfosFromTemplate(template, false);
    expect(result).toEqual([]);
  });

  it('should extract bind node information from template', () => {
    template.innerHTML = `
      <div data-bind="text: name"></div>
      <span data-bind="text: age"></span>
    `;
    const result = extractBindNodeInfosFromTemplate(template, false);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(BindingNode);
    expect(result[1]).toBeInstanceOf(BindingNode);
  });

  it('should ignore nodes with empty bind text', () => {
    template.innerHTML = `
      <div data-bind=""></div>
      <span data-bind="text: age"></span>
    `;
    const result = extractBindNodeInfosFromTemplate(template, false);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(BindingNode);
  });

  it('should handle expandable comments', () => {
    template.innerHTML = `
      <div><!--@@:aaaaaaaa--></div>
      <span data-bind="text: age"></span>
    `;
    const templateIf = document.createElement('template') as HTMLTemplateElement;
    templateIf.dataset.bind = 'name';
    (getByUUID as jest.Mock).mockReturnValue(templateIf);

    const result = extractBindNodeInfosFromTemplate(template, false);
    expect(result.length).toBe(2);
    expect(result[0]).toBeInstanceOf(BindingNode);
    expect(result[1]).toBeInstanceOf(BindingNode);
  });

  it('should use keyed binding if useKeyed is true', () => {
    template.innerHTML = `
      <div data-bind="text: name"></div>
    `;
    const result = extractBindNodeInfosFromTemplate(template, true);
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(BindingNode);
  });
});