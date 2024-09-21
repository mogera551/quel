import "jest";
import { Handler } from "../../src/state/Handler";
import { AccessorPropertiesSymbol, ConnectedCallbackSymbol, ConnectedEventSymbol, DependenciesSymbol, GetDependentPropsApiSymbol } from "../../src/state/symbols";
import { IComponent } from "../../src/component/types";
import { IBaseState, IDependentProps, IStateProxy } from "../../src/state/types";
import { dispatchCustomEvent } from "../../src/state/dispatchCustomEvent";

jest.mock("../../src/state/dispatchCustomEvent");

describe('Handler', () => {
  let component: IComponent;
  let baseState: IBaseState & { [key: string]: any };
  let handler: Handler;

  beforeEach(() => {
    component = {
      states: {},
      updator: {
        update: jest.fn()
      }
    } as unknown as IComponent;
    
    baseState = {
      // Define the base state properties here
      get aaa() {
        return 'value';
      },
      bbb : {
        ccc: 'value'
      },
      $dependentProps: {
        test: ['testValue']
      }
    };

    handler = new Handler(component, baseState);
  });

  it('should initialize with correct properties', () => {
    expect(handler.accessorProperties).toBeInstanceOf(Set);
    expect(handler.dependentProps).toBeInstanceOf(Object);
    expect(handler.element).toBe(component);
    expect(handler.component).toBe(component);
    expect(handler.updator).toBe(component.updator);
  });

  it('should get value by symbol', () => {
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    expect(stateProxy[AccessorPropertiesSymbol]).toEqual(new Set(['aaa']));
    const dependencies = stateProxy[DependenciesSymbol] as IDependentProps;
    expect(dependencies.propsByRefProp).toEqual({
      testValue: new Set(['test'])
    });
    expect(dependencies.setDefaultProp).toBeInstanceOf(Function);
  });

  it('should get value by symbol for callback', async () => {
    const connectedCallback = jest.fn();
    baseState["$connectedCallback"] = connectedCallback;
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    await stateProxy[ConnectedCallbackSymbol]();
    expect(connectedCallback).toHaveBeenCalledWith();
    expect(dispatchCustomEvent).toHaveBeenCalledWith(handler.element, ConnectedEventSymbol, []);
  });

  it('should get value by symbol for api', async () => {
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    const dependentProps = await stateProxy[GetDependentPropsApiSymbol]();
    expect(dependentProps).toBe(handler.dependentProps);
  });

  it('should get undefined for unknown symbol', () => {
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    expect(stateProxy[Symbol('unknownSymbol')]).toBeUndefined();
  });

  it('should get value by string', () => {
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    expect(stateProxy['$dependentProps']).toBe(baseState.$dependentProps);
  });

  it('should call cache clear', () => {
    const returnValue = handler.clearCache();
    expect(returnValue).toBeUndefined();
  });

  it('should call directlyCallback', async () => {
    const callback = jest.fn();
    const returnValue = await handler.directlyCallback(undefined, callback);
    expect(callback).toHaveBeenCalledTimes(0);
    expect(returnValue).toBeUndefined();
  });

  it('should get nested value', () => {
    const stateProxy = new Proxy(baseState, handler) as IStateProxy;
    expect(stateProxy["bbb.ccc"]).toBe('value');
    expect(handler.dependentProps.propsByRefProp).toEqual({
      testValue: new Set(['test']),
      "bbb": new Set(['bbb.ccc'])
    });
  });
});