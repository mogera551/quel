import "jest";
import { getStatePropertyConstructor } from "../../src/binder/getStatePropertyConstructor";
import { ContextIndex } from "../../src/binding/stateProperty/ContextIndex";
import { StateProperty } from "../../src/binding/stateProperty/StateProperty";
import { IBinding, IStateProperty } from "../../src/binding/types";
import { IFilterText } from "../../src/filter/types";

describe('getStatePropertyConstructor', () => {
  const mockBinding: IBinding = {} as IBinding;
  const mockFilters: IFilterText[] = [];

  it('should return a constructor for ContextIndex when propertyName matches the regexp', () => {
    const propertyName = "$123";
    const constructor = getStatePropertyConstructor(propertyName);
    const instance = constructor(mockBinding, propertyName, mockFilters);
    
    expect(instance).toBeInstanceOf(ContextIndex);
  });

  it('should return a constructor for StateProperty when propertyName does not match the regexp', () => {
    const propertyName = "someProperty";
    const constructor = getStatePropertyConstructor(propertyName);
    const instance = constructor(mockBinding, propertyName, mockFilters);
    
    expect(instance).toBeInstanceOf(StateProperty);
  });
});