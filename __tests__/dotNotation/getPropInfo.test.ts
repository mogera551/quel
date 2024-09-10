import 'jest';
import { getPropInfo } from '../../src/dotNotation/getPropInfo';

describe('getPropInfo', () => {
  it('should return the correct prop info for a simple property', () => {
    const propInfo = getPropInfo('name');
    expect(propInfo.name).toBe('name');
    expect(propInfo.pattern).toBe('name');
    expect(propInfo.elements).toEqual(['name']);
    expect(propInfo.patternElements).toEqual(['name']);
    expect(propInfo.paths).toEqual(['name']);
    expect(propInfo.patternPaths).toEqual(['name']);
    expect(propInfo.wildcardPaths).toEqual([]);
    expect(propInfo.wildcardCount).toBe(0);
    expect(propInfo.wildcardIndexes).toEqual([]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(-1);
  });

  it('should return the correct prop info for a nested property', () => {
    const propInfo = getPropInfo('person.address.city');
    expect(propInfo.name).toBe('person.address.city');
    expect(propInfo.pattern).toBe('person.address.city');
    expect(propInfo.elements).toEqual(['person', 'address', 'city']);
    expect(propInfo.patternElements).toEqual(['person', 'address', 'city']);
    expect(propInfo.paths).toEqual(['person', 'person.address', 'person.address.city']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.address', 'person.address.city']);
    expect(propInfo.wildcardPaths).toEqual([]);
    expect(propInfo.wildcardCount).toBe(0);
    expect(propInfo.wildcardIndexes).toEqual([]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(-1);
  });

  it('should return the correct prop info for a property with wildcard', () => {
    const propInfo = getPropInfo('person.*.city');
    expect(propInfo.name).toBe('person.*.city');
    expect(propInfo.pattern).toBe('person.*.city');
    expect(propInfo.elements).toEqual(['person', '*', 'city']);
    expect(propInfo.patternElements).toEqual(['person', '*', 'city']);
    expect(propInfo.paths).toEqual(['person', 'person.*', 'person.*.city']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city']);
    expect(propInfo.wildcardPaths).toEqual(['person.*']);
    expect(propInfo.wildcardCount).toBe(1);
    expect(propInfo.wildcardIndexes).toEqual([undefined]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(0);
  });

  it('should return the correct prop info for a property with wildcard', () => {
    const propInfo = getPropInfo('person.*.city.*');
    expect(propInfo.name).toBe('person.*.city.*');
    expect(propInfo.pattern).toBe('person.*.city.*');
    expect(propInfo.elements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.paths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
    expect(propInfo.wildcardCount).toBe(2);
    expect(propInfo.wildcardIndexes).toEqual([undefined, undefined]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(1);
  });

  it('should return the correct prop info for a property with number', () => {
    const propInfo = getPropInfo('person.0.city.1');
    expect(propInfo.name).toBe('person.0.city.1');
    expect(propInfo.pattern).toBe('person.*.city.*');
    expect(propInfo.elements).toEqual(['person', '0', 'city', '1']);
    expect(propInfo.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.paths).toEqual(['person', 'person.0', 'person.0.city', 'person.0.city.1']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
    expect(propInfo.wildcardCount).toBe(2);
    expect(propInfo.wildcardIndexes).toEqual([0, 1]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(-1);
  });

  it('should return the correct prop info for a property with number', () => {
    const propInfo = getPropInfo('person.*.city.1');
    expect(propInfo.name).toBe('person.*.city.1');
    expect(propInfo.pattern).toBe('person.*.city.*');
    expect(propInfo.elements).toEqual(['person', '*', 'city', '1']);
    expect(propInfo.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.paths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.1']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
    expect(propInfo.wildcardCount).toBe(2);
    expect(propInfo.wildcardIndexes).toEqual([undefined, 1]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(0);
  });

  it('should return the correct prop info for a property with number', () => {
    const propInfo = getPropInfo('person.0.city.*');
    expect(propInfo.name).toBe('person.0.city.*');
    expect(propInfo.pattern).toBe('person.*.city.*');
    expect(propInfo.elements).toEqual(['person', '0', 'city', '*']);
    expect(propInfo.patternElements).toEqual(['person', '*', 'city', '*']);
    expect(propInfo.paths).toEqual(['person', 'person.0', 'person.0.city', 'person.0.city.*']);
    expect(propInfo.patternPaths).toEqual(['person', 'person.*', 'person.*.city', 'person.*.city.*']);
    expect(propInfo.wildcardPaths).toEqual(['person.*', 'person.*.city.*']);
    expect(propInfo.wildcardCount).toBe(2);
    expect(propInfo.wildcardIndexes).toEqual([0, undefined]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(1);
  });

  it('should return the correct prop info for a simple property', () => {
    const propInfo = getPropInfo('name');
    expect(propInfo.name).toBe('name');
    expect(propInfo.pattern).toBe('name');
    expect(propInfo.elements).toEqual(['name']);
    expect(propInfo.patternElements).toEqual(['name']);
    expect(propInfo.paths).toEqual(['name']);
    expect(propInfo.patternPaths).toEqual(['name']);
    expect(propInfo.wildcardPaths).toEqual([]);
    expect(propInfo.wildcardCount).toBe(0);
    expect(propInfo.wildcardIndexes).toEqual([]);
    expect(propInfo.lastIncompleteWildcardIndex).toBe(-1);
  });
});
