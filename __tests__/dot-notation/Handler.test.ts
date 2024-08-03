import { Handler } from '../../src/dot-notation/Handler';

describe('Handler', () => {
  let handler: Handler;

  beforeEach(() => {
    handler = new Handler();
  });

  it('should get the lastIndexes', () => {
    const lastIndexes = handler.lastIndexes;
    expect(lastIndexes).toEqual([]);
  });

  it('should get the stackIndexes', () => {
    const stackIndexes = handler.stackIndexes;
    expect(stackIndexes).toEqual([]);
  });

  it('should get a property', () => {
    const target = { prop: 'value' };
    const receiver = target;
    const result = handler.get(target, 'prop', receiver);
    expect(result).toBe('value');
  });

  it('should set a property', () => {
    const target = {};
    const receiver = target;
    const result = handler.set(target, 'prop', 'value', receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ prop: 'value' });
  });

  it('should get a property with context index', () => {
    const target = {};
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.get(target, '$1', receiver);
    expect(result).toBe(2);
  });
  it('should get a property with context index', () => {
    const target = {};
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '$1', receiver);
    expect(result).toBe(undefined);
  });

  it('should set a property with context index', () => {
    const target = {};
    const receiver = target;
    handler.stackIndexes.push([2]);
    expect(() => {
      const result = handler.set(target, '$1', 3, receiver);
    }).toThrow('context index($1) is read only');
  });

  it('should get a property with wild card', () => {
    const target = { aaa: [111, 222, 333] };
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.get(target, 'aaa.*', receiver);
    expect(result).toBe(333);
  });

  it('should set a property with wild card', () => {
    const target = { aaa: [111, 222, 333] };
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.set(target, 'aaa.*', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [111, 222, 444] });
  });

  it('should get a property with wild card', () => {
    const target = { aaa: [ { value:111 }, { value:222 }, { value:333 } ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.get(target, 'aaa.*.value', receiver);
    expect(result).toBe(222);
  });

  it('should set a property with wild card', () => {
    const target = { aaa: [ { value:111 }, { value:222 }, { value:333 } ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.set(target, 'aaa.*.value', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ { value:111 }, { value:444 }, { value:333 } ] });
  });

  it('should get a property with expand last index', () => {
    const target = { aaa: [111, 222, 333] };
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.get(target, '@aaa.*', receiver);
    expect(result).toEqual([111, 222, 333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.get(target, '@aaa.*.*', receiver);
    expect(result).toEqual([1111, 2222, 3333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.get(target, '@aaa.*.*', receiver);
    }).toThrow('propertyName(aaa.*.*) has many wildcards');
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.get(target, '@aaa.*.*', receiver);
    expect(result).toEqual([1111,2222,3333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1,0]);
    const result = handler.get(target, '@aaa.*.*', receiver);
    expect(result).toEqual([1111,2222,3333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '@aaa.0.*', receiver);
    expect(result).toEqual([111, 222, 333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '@aaa.1.*', receiver);
    expect(result).toEqual([1111, 2222, 3333]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '@aaa.*.0', receiver);
    expect(result).toEqual([111, 1111]);
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '@aaa.*.2', receiver);
    expect(result).toEqual([333, 3333]);
  });

  it('should set a property with expand last index', () => {
    const target = { aaa: [111, 222, 333] };
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.set(target, '@aaa.*', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [444, 444, 444] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [111, 222, 333] };
    const receiver = target;
    handler.stackIndexes.push([2]);
    const result = handler.set(target, '@aaa.*', [ 444, 555, 666 ], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [444, 555, 666] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.set(target, '@aaa.*.*', 4444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444,4444,4444] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.set(target, '@aaa.*.*', [ 4444, 5555, 6666 ], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 5555, 6666] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, '@aaa.*.*', 4444, receiver);
    }).toThrow('propertyName(aaa.*.*) has many wildcards');
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, '@aaa.*.*', [4444,5555,6666], receiver);
    }).toThrow('propertyName(aaa.*.*) has many wildcards');
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.set(target, '@aaa.*.*', 4444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 4444, 4444] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1]);
    const result = handler.set(target, '@aaa.*.*', [ 4444, 5555, 6666 ], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 5555, 6666] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1,0]);
    const result = handler.set(target, '@aaa.*.*', 4444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 4444, 4444] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1,0]);
    const result = handler.set(target, '@aaa.*.*', [4444, 5555, 6666], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 5555, 6666] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.0.*', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [444, 444, 444], [1111,2222,3333] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.0.*', [444, 555, 666], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [444, 555, 666], [1111,2222,3333] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.1.*', 4444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 4444, 4444] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.1.*', [4444, 5555, 6666], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [4444, 5555, 6666] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.*.0', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [444, 222, 333], [444,2222,3333] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.*.0', [444, 4444], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [444, 222, 333], [4444,2222,3333] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.*.2', 444, receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 444], [1111,2222,444] ] });
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@aaa.*.2', [444, 4444], receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 444], [1111,2222,4444] ] });
  });

  it('should get a special property', () => {
    const target = { "@@__hoge": 'value' };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, '@@__hoge', receiver);
    expect(result).toBe("value");
  });
  it('should set a special property', () => {
    const target = { "@@__hoge": 'value' };
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, '@@__hoge', "VALUE", receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ "@@__hoge": "VALUE" });
  });
  it('should get a special property', () => {
    class Target {
      prop:string;
      constructor() {
        this.prop = 'value';
      }
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, 'constructor', receiver);
    expect(result).toBe(target.constructor);
  });
  it('should get a special property', () => {
    const symbol = Symbol.for('test');
    class Target {
      prop:string;
      [symbol]:string;
      constructor() {
        this.prop = 'value';
        this[symbol] = 'symbol';
      }
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, symbol, receiver);
    expect(result).toBe('symbol');
  });

  it('should set a special property', () => {
    const symbol = Symbol.for('test');
    class Target {
      prop:string;
      [symbol]:string;
      constructor() {
        this.prop = 'value';
        this[symbol] = 'symbol';
      }
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.set(target, symbol, 'SYMBOL', receiver);
    expect(result).toBe(true);
    expect(target[symbol]).toBe('SYMBOL');
  });

  it('should get property', () => {
    class Target {
      prop:(string|undefined);
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, 'prop', receiver);
    expect(result).toBe(undefined);
  });

  it('should get property', () => {
    class Target {
      "prop.name":(string|undefined);
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    const result = handler.get(target, 'prop.name', receiver);
    expect(result).toBe(undefined);
  });

  it('should set property', () => {
    class Target {
      "prop.name":(string|undefined);
    }
    const target = new Target;
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, 'prop.name', 100, receiver);
    }).toThrow('parent(prop) is undefined');
  });

  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.get(target, '@aaa.1.0', receiver);
    }).toThrow('propertyName(aaa.1.0) has no wildcard');
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, '@aaa.1.0', 4444, receiver);
    }).toThrow('propertyName(aaa.1.0) has no wildcard');
  });
  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.get(target, '@aaa', receiver);
    }).toThrow('propertyName(aaa) has no wildcard');
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, '@aaa', 4444, receiver);
    }).toThrow('propertyName(aaa) has no wildcard');
  });

  it('should get a property with expand last index', () => {
    const target = { aaa: 100 };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.get(target, '@aaa.*', receiver);
    }).toThrow('values is not an array');
  });
  it('should set a property with expand last index', () => {
    const target = { aaa: 100 };
    const receiver = target;
    handler.stackIndexes.push([]);
    expect(() => {
      const result = handler.set(target, '@aaa.*', 4444, receiver);
    }).toThrow('values is not an array');
  });

  it('should get a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1,2]);
    const result = handler.get(target, 'aaa.*.*', receiver);
    expect(result).toEqual(3333);
    const result2 = handler.get(target, 'aaa.0.*', receiver);
    expect(result2).toEqual(333);
    const result3 = handler.get(target, 'aaa.*.1', receiver);
    expect(result3).toEqual(2222);
    const result4 = handler.get(target, 'aaa.0.0', receiver);
    expect(result4).toEqual(111);
  });

  it('should set a property with expand last index', () => {
    const target = { aaa: [ [111, 222, 333], [1111,2222,3333] ] };
    const receiver = target;
    handler.stackIndexes.push([1,2]);
    const result = handler.set(target, 'aaa.*.*', 555,  receiver);
    expect(result).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 333], [1111,2222,555] ] });
    const result2 = handler.set(target, 'aaa.0.*', 666, receiver);
    expect(result2).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 666], [1111,2222,555] ] });
    const result3 = handler.set(target, 'aaa.*.1', 777, receiver);
    expect(result3).toBe(true);
    expect(target).toEqual({ aaa: [ [111, 222, 666], [1111,777,555] ] });
    const result4 = handler.set(target, 'aaa.0.0', 888, receiver);
    expect(result4).toBe(true);
    expect(target).toEqual({ aaa: [ [888, 222, 666], [1111,777,555] ] });
  });
});