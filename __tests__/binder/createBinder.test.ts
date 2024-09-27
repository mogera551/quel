import "jest";
import { createBinder } from "../../src/binder/createBinder";
import { IBinder } from "../../src/binder/types";
import { IBinding, IBindingSummary, IComponentPartial, IContentBindings } from "../../src/binding/types";
import { createContentBindings } from "../../src/binding/ContentBindings";
import { IStates } from "../../src/state/types";
import { IUpdator } from "../../src/updator/types";
import { FilterFuncWithOptionType } from "../../src/filter/types";

describe('createBinder', () => {
  let template: HTMLTemplateElement;

  beforeEach(() => {
    template = document.createElement('template');
    template.dataset.uuid = 'test-uuid';
  });

  it('should create a new Binder instance if not cached', () => {
    const binder = createBinder(template, false);
    expect(binder).toBeDefined();
    expect(binder).toHaveProperty('createBindings');
  });

  it('should return the same Binder instance if cached', () => {
    const binder1 = createBinder(template, false);
    const binder2 = createBinder(template, false);
    expect(binder1).toBe(binder2);
  });

  it('should create different Binder instances for different templates', () => {
    const template2 = document.createElement('template');
    template2.dataset.uuid = 'test-uuid2';
    const binder1 = createBinder(template, false);
    const binder2 = createBinder(template2, false);
    expect(binder1).not.toBe(binder2);
  });

  it('should throw an error if uuid is not found', () => {
    template.removeAttribute('data-uuid');
    expect(() => createBinder(template, false)).toThrow("uuid not found");
  });

});

describe('Binder', () => {
  let template: HTMLTemplateElement;
  let rootNode: HTMLElement
  let binder: IBinder;
  let component: IComponentPartial

  beforeEach(() => {
    rootNode = document.createElement('div');
    rootNode.innerHTML = `
      <div data-bind="text: name"></div>
    `;
    template = document.createElement('template');
    template.dataset.uuid = 'test-uuid3';
    template.content.appendChild(rootNode);
    binder = createBinder(template, false);
    component = {
      useKeyed: false,
      selectorName: "test-uuid3",
      eventFilterManager: {
        ambigousNames: new Set<string>(),
        funcByName: new Map<string, FilterFuncWithOptionType<"Event">>(),
        registerFilter: jest.fn(),
        getFilterFunc: jest.fn(),
      },
      inputFilterManager: {
        ambigousNames: new Set<string>(),
        funcByName: new Map<string, FilterFuncWithOptionType<"input">>(),
        registerFilter: jest.fn(),
        getFilterFunc: jest.fn(),
      },
      outputFilterManager: {
        ambigousNames: new Set<string>(),
        funcByName: new Map<string, FilterFuncWithOptionType<"output">>(),
        registerFilter: jest.fn(),
        getFilterFunc: jest.fn(),
      },
      states: {} as IStates,
      bindingSummary: {
        updated: false,
        updateRevision: 0,
        bindingsByKey: new Map<string,IBinding[]>(),
        expandableBindings: new Set<IBinding>(),
        componentBindings: new Set<IBinding>(),
        allBindings: new Set<IBinding>(),
        add: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
        flush: jest.fn(),
        update: jest.fn(),
        partialUpdate: jest.fn()
      } as IBindingSummary,
      updator: {} as IUpdator,
    };
  });

  it('should create bindings', () => {
    const contentBindings = createContentBindings(template, undefined, component);
    const bindings = binder.createBindings(template.content, contentBindings);
    expect(bindings).toBeDefined();
    expect(Array.isArray(bindings)).toBe(true);
  });
});