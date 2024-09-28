import "jest";
import { getApiMethod } from "../../src/state/getApiMethod";
import { IStateHandler, IStateProxy } from "../../src/state/types";
import { ILoopContext } from "../../src/loopContext/types";
import { IComponent } from "../../src/component/types";
import { ClearCacheApiSymbol, CreateBufferApiSymbol, DirectryCallApiSymbol, FlushBufferApiSymbol, GetDependentPropsApiSymbol, NotifyForDependentPropsApiSymbol } from "../../src/state/symbols";
import { IDotNotationHandler } from "../../src/dotNotation/types";

describe('getApiMethod', () => {
let state:  { [key: string]: any };
let stateProxy: IStateProxy;
let handler: IStateHandler & Pick<IDotNotationHandler, "clearCache">;

beforeEach(() => {
  state = {};
  stateProxy = new Proxy(state, {}) as IStateProxy;
  handler = {
    directlyCallback: (loopContext: ILoopContext, callback: () => any) => callback(),
    updator: {
      addUpdatedStateProperty: jest.fn()
    },
    dependentProps: {},
    clearCache: jest.fn()
  } as unknown as (IStateHandler & Pick<IDotNotationHandler, "clearCache">);
  
});

it('should return a function for DirectryCallApiSymbol', async () => {
  const prop = DirectryCallApiSymbol;
  state["testProp"] = jest.fn();
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  const loopContext = {indexes: [1,2,3]} as ILoopContext;
  const event = new Event('test');
  await apiMethod?.('testProp', loopContext, event);
  expect(state["testProp"]).toHaveBeenCalledWith(event, 1,2,3);

  const undefinedloopContext = undefined;
  await apiMethod?.('testProp', undefinedloopContext, event);
  expect(state["testProp"]).toHaveBeenCalledWith(event);

});

it('should return a function for NotifyForDependentPropsApiSymbol', () => {
  const prop = NotifyForDependentPropsApiSymbol;
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  const indexes = [1, 2, 3];
  apiMethod?.('testProp', indexes);
  expect(handler.updator.addUpdatedStateProperty).toHaveBeenCalled();
});

it('should return a function for GetDependentPropsApiSymbol', () => {
  const prop = GetDependentPropsApiSymbol;
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  const result = apiMethod?.();
  expect(result).toBe(handler.dependentProps);
});

it('should return a function for ClearCacheApiSymbol', () => {
  const prop = ClearCacheApiSymbol;
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  apiMethod?.();
  expect(handler.clearCache).toHaveBeenCalled();
});

it('should return a function for CreateBufferApiSymbol', () => {
  const prop = CreateBufferApiSymbol;
  stateProxy.$createBuffer = jest.fn();
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  const component = {} as IComponent;
  apiMethod?.(component);
  expect(stateProxy.$createBuffer).toHaveBeenCalledWith(component);
});

it('should return a function for FlushBufferApiSymbol', () => {
  const prop = FlushBufferApiSymbol;
  stateProxy.$flushBuffer = jest.fn();
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(typeof apiMethod).toBe('function');

  const buffer = {};
  const component = {} as IComponent;
  apiMethod?.(buffer, component);
  expect(stateProxy.$flushBuffer).toHaveBeenCalledWith(buffer, component);
});

it('should return undefined for unknown symbol', () => {
  const prop = Symbol('unknown');
  const apiMethod = getApiMethod(state, stateProxy, handler, prop);
  expect(apiMethod).toBeUndefined();
});
});