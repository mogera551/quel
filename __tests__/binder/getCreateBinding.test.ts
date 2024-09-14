import "jest";
import { getCreateBinding } from '../../src/binder/getCreateBinding';
import { ParsedBindText, PropertyConstructors } from '../../src/binder/types';
import { IBinding, IContentBindings } from '../../src/binding/types';
import { createBinding } from '../../src/binding/Binding';

jest.mock('../../src/binding/Binding');

describe('getCreateBinding', () => {
  const mockCreateBinding = createBinding as jest.MockedFunction<typeof createBinding>;

  const bindTextInfo: ParsedBindText = {
    nodeProperty: 'textContent',
    inputFilters: [],
    stateProperty: 'value',
    outputFilters: []
  };

  const propertyCreators: PropertyConstructors = {
    nodePropertyConstructor: jest.fn(),
    statePropertyConstructor: jest.fn()
  };

  const contentBindings: IContentBindings = {} as IContentBindings;

  const node = document.createElement('div');

  beforeEach(() => {
    mockCreateBinding.mockClear();
  });

  it('should call createBinding with correct arguments', () => {
    const createBindingFunc = getCreateBinding(bindTextInfo, propertyCreators);
    createBindingFunc(contentBindings, node);

    expect(mockCreateBinding).toHaveBeenCalledWith(
      contentBindings,
      node,
      bindTextInfo.nodeProperty,
      propertyCreators.nodePropertyConstructor,
      bindTextInfo.inputFilters,
      bindTextInfo.stateProperty,
      propertyCreators.statePropertyConstructor,
      bindTextInfo.outputFilters
    );
  });

  it('should return the result of createBinding', () => {
    const expectedBinding: IBinding = { /* mock binding object */ } as IBinding;
    mockCreateBinding.mockReturnValue(expectedBinding);

    const createBindingFunc = getCreateBinding(bindTextInfo, propertyCreators);
    const result = createBindingFunc(contentBindings, node);

    expect(result).toBe(expectedBinding);
  });
});