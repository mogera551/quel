import { Binder } from '../../src/newBinder/Binder.js';

// Mocks for external dependencies and methods not being directly tested
jest.mock('./defaultProperty.js', () => ({
  getDefaultProperty: jest.fn().mockReturnValue('value'),
}));
jest.mock('./bindText.js', () => ({
  getBindText: jest.fn().mockReturnValue('bindText'),
}));
jest.mock('./parseBindText.js', () => ({
  parse: jest.fn().mockReturnValue([{ nodeProperty: 'prop', viewModelProperty: 'vmProp' }]),
}));
jest.mock('./constructors.js', () => ({
  getConstructors: jest.fn().mockReturnValue({ nodePropertyConstructor: Function, viewModelPropertyConstructor: Function }),
}));
jest.mock('./replaceTextNode.js', () => ({
  replaceTextNode: jest.fn().mockImplementation(node => node),
}));
jest.mock('./removeAttribute.js', () => ({
  removeAttribute: jest.fn(),
}));
jest.mock('./isInputable.js', () => ({
  isInputable: jest.fn().mockReturnValue(false),
}));
jest.mock('./InitializeNode.js', () => ({
  InitializeNode: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('./commentNodes.js', () => ({
  getCommentNodes: jest.fn().mockReturnValue([]),
}));
jest.mock('./nodeType.js', () => ({
  getNodeType: jest.fn().mockReturnValue('type'),
}));
jest.mock('./nodeRoute.js', () => ({
  computeNodeRoute: jest.fn().mockReturnValue([1, 2, 3]),
  findNodeByNodeRoute: jest.fn().mockImplementation((content, route) => content.querySelector('div')),
}));

describe('Binder', () => {
  let template;
  beforeEach(() => {
    template = document.createElement('template');
    template.innerHTML = `<div data-bind=""></div>`;
    document.body.appendChild(template);
  });

  afterEach(() => {
    document.body.removeChild(template);
  });

  test('Binder constructor initializes properties correctly', () => {
    const binder = new Binder(template, 'uuid123', true);
    expect(binder.template).toBe(template);
    expect(binder.uuid).toBe('uuid123');
    expect(binder.nodeInfos).toEqual([]);
  });

  test('parse method populates nodeInfos correctly', () => {
    const binder = new Binder(template, 'uuid123', true);
    binder.parse(true);
    expect(binder.nodeInfos.length).toBeGreaterThan(0);
    expect(binder.nodeInfos[0]).toHaveProperty('nodeType');
    expect(binder.nodeInfos[0]).toHaveProperty('bindTextInfos');
  });

  test('createBindings method returns bindings array', () => {
    const binder = new Binder(template, 'uuid123', true);
    binder.parse(true);
    const content = document.createDocumentFragment();
    content.appendChild(document.createElement('div'));
    const bindings = binder.createBindings(content, {});
    expect(Array.isArray(bindings)).toBeTruthy();
    expect(bindings.length).toBeGreaterThan(0);
  });

  test('create method returns same instance for same UUID', () => {
    const binder1 = Binder.create(template, true);
    const binder2 = Binder.create(template, true);
    expect(binder1).toBe(binder2);
  });

  test('create method returns new instance for different UUIDs', () => {
    const template2 = document.createElement('template');
    template2.innerHTML = `<div data-bind=""></div>`;
    document.body.appendChild(template2);
    const binder1 = Binder.create(template, true);
    const binder2 = Binder.create(template2, true);
    document.body.removeChild(template2);
    expect(binder1).not.toBe(binder2);
  });
});