import 'jest';
import { getPatternInfo } from '../../src/dotNotation/getPatternInfo';

describe("getPatternInfo", () => {
  it('should return the correct prop info for a simple property', () => {
    const propInfo = getPatternInfo('name');
    expect(propInfo.patternElements).toEqual(['name']);
    expect(propInfo.patternPaths).toEqual(['name']);
    expect(propInfo.wildcardPaths).toEqual([]);
  });
  it('should return the correct prop info for a nested property', () => {
    const propInfo = getPatternInfo('person.address.city');
    expect(propInfo.patternElements).toEqual(['person', 'address', 'city']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.address', 'person.address.city']);
    expect(propInfo.wildcardPaths).toEqual([]);
  });
  it('should return the correct prop info for a property with wildcard', () => {
    const propInfo = getPatternInfo('person.*.city');
    expect(propInfo.patternElements).toEqual(['person', '*', 'city']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city']);
    expect(propInfo.wildcardPaths).toEqual(['person.*']);
  });
  it('should return the correct prop info for a property with wildcard', () => {
    const propInfo = getPatternInfo('person.*.city.*');
    expect(propInfo.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
    const propInfo2 = getPatternInfo('person.*.city.*');
    expect(propInfo2.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo2.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo2.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
  });

})
