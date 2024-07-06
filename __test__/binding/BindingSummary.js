import { BindingSummary } from './BindingSummary';

describe('BindingSummary', () => {
  let summary;

  beforeEach(() => {
    summary = new BindingSummary();
  });

  test('updated getter and setter', () => {
    summary.updated = true;
    expect(summary.updated).toBe(true);
    summary.updated = false;
    expect(summary.updated).toBe(false);
  });

  test('updateRevision increments', () => {
    expect(summary.updateRevision).toBe(0);
    summary.update(() => {});
    expect(summary.updateRevision).toBe(1);
  });

  test('getters throw during update', () => {
    expect(() => summary.bindingsByKey).not.toThrow();
    summary.update(() => {
      expect(() => summary.bindingsByKey).toThrow();
      expect(() => summary.expandableBindings).toThrow();
      expect(() => summary.componentBindings).toThrow();
    });
  });

  test('add, delete, and exists methods', () => {
    const mockBinding = { viewModelProperty: { key: 'testKey' }, nodeProperty: {} };
    summary.update((s) => {
      s.add(mockBinding);
      expect(s.exists(mockBinding)).toBe(true);
      s.delete(mockBinding);
      expect(s.exists(mockBinding)).toBe(false);
    });
  });

  test('update method and callback', () => {
    const callback = jest.fn();
    summary.update(callback);
    expect(callback).toHaveBeenCalledWith(summary);
    expect(summary.updated).toBe(false); // Assuming no changes were made in the callback
  });

  test('rebuild method', () => {
    const mockBindings = new Set([{ viewModelProperty: { key: 'key1' }, nodeProperty: {} }]);
    summary.rebuild(mockBindings);
    expect(summary.allBindings).toEqual(mockBindings);
    expect(summary.bindingsByKey.size).toBe(1);
    expect(summary.expandableBindings.size).toBe(0);
    expect(summary.componentBindings.size).toBe(0);
  });
});