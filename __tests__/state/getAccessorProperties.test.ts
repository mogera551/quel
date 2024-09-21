import "jest";
import { getAccessorProperties } from '../../src/state/getAccessorProperties';

class TestClass {
  private _value: number = 0;

  get value(): number {
    return this._value;
  }

  set value(val: number) {
    this._value = val;
  }

  method() {
    return 'method';
  }
}

class DerivedClass extends TestClass {
  private _anotherValue: string = '';

  get anotherValue(): string {
    return this._anotherValue;
  }

  set anotherValue(val: string) {
    this._anotherValue = val;
  }
}

describe('getAccessorProperties', () => {
  it('should return accessor properties for a class', () => {
    const instance = new TestClass();
    const accessorProperties = getAccessorProperties(instance);
    expect(accessorProperties).toContain('value');
    expect(accessorProperties).not.toContain('method');
  });

  it('should return accessor properties for a derived class', () => {
    const instance = new DerivedClass();
    const accessorProperties = getAccessorProperties(instance);
    expect(accessorProperties).toContain('value');
    expect(accessorProperties).toContain('anotherValue');
    expect(accessorProperties).not.toContain('method');
  });

  it('should cache accessor properties', () => {
    const instance = new TestClass();
    const accessorProperties1 = getAccessorProperties(instance);
    const accessorProperties2 = getAccessorProperties(instance);
    expect(accessorProperties1).toBe(accessorProperties2);
  });

  it('should handle objects without accessor properties', () => {
    const instance = { a: 1, b: 2 };
    const accessorProperties = getAccessorProperties(instance);
    expect(accessorProperties).toEqual([]);
  });

  it('should handle objects with mixed properties', () => {
    const instance = {
      _value: 0,
      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },
      method() {
        return 'method';
      }
    };
    const accessorProperties = getAccessorProperties(instance);
    expect(accessorProperties).toContain('value');
    expect(accessorProperties).not.toContain('method');
  });
});