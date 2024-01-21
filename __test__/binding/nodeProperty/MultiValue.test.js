import { MultiValue } from '../../../src/binding/nodeProperty/MultiValue.js';

describe('MultiValue', () => {
  it('should have a value property', () => {
    const value = 'value';
    const multiValue = new MultiValue(value, true);
    expect(multiValue.value).toBe(value);
  });
  it('should have an enabled property', () => {
    const enabled = true;
    const multiValue = new MultiValue('value', enabled);
    expect(multiValue.enabled).toBe(enabled);
  });
  it('should have a constructor', () => {
    const value = 'value';
    const enabled = true;
    const multiValue = new MultiValue(value, enabled);
    expect(multiValue.value).toBe(value);
    expect(multiValue.enabled).toBe(enabled);
  });
});
