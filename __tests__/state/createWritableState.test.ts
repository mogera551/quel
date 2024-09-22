import "jest";
import { createWritableState } from '../../src/state/createWritableState';
import { IComponentForHandler, IStateProxy } from '../../src/state/types';
import { ILoopContext } from '../../src/loopContext/types';
import { PropertyAccess } from '../../src/binding/PropertyAccess';
import { DirectryCallApiSymbol } from "../../src/state/symbols";

describe('createWritableState', () => {
  let component: IComponentForHandler;
  beforeEach(() => {
    component = {
      states: {},
      updator: {
        update: jest.fn(),
        addUpdatedStateProperty: jest.fn()
      }
    } as unknown as IComponentForHandler;
  });

  it('should set value', () => {
    const state = {
      prop1: 'value1',
      prop2: 'value2'
    };
    const stateProxy = createWritableState(component, state);
    stateProxy.prop1 = 'newValue';
    expect(state.prop1).toBe('newValue');
    expect(component.updator.addUpdatedStateProperty).toHaveBeenCalledWith(new PropertyAccess('prop1', []));
  });

  it('should set nested value', () => {
    const state = {
      prop1: 'value1',
      prop2: {
        prop3: 'value3'
      }
    };
    const stateProxy = createWritableState(component, state);
    stateProxy['prop2.prop3'] = 'newValue';
    expect(stateProxy["prop2.prop3"]).toBe('newValue');
    expect(state.prop2.prop3).toBe('newValue');
    expect(component.updator.addUpdatedStateProperty).toHaveBeenCalledWith(new PropertyAccess('prop2.prop3', []));
  });

  it('should set array value', () => {
    const state = {
      prop1: [1,2,3,4],
    };
    const stateProxy = createWritableState(component, state);
    stateProxy['prop1.2'] = 5;
    expect(stateProxy["prop1.2"]).toBe(5);
    expect(state.prop1[2]).toBe(5);
    expect(component.updator.addUpdatedStateProperty).toHaveBeenCalledWith(new PropertyAccess('prop1.*', [2]));
  });

  it('should directly call callback', async () => {
    const state = {
      func: jest.fn()
    };
    const stateProxy = createWritableState(component, state);
    const event = new Event('click');
    const loopContext: ILoopContext = {
      // mock loopContext properties and methods if necessary
      find: jest.fn()
    } as unknown as ILoopContext;
    (loopContext.find as jest.Mock).mockReturnValue(undefined);
    stateProxy[DirectryCallApiSymbol]("func", loopContext, event);
    expect(state.func).toHaveBeenCalledWith(event);
  });

  it('should directly call callback with loop', async () => {
    const state = {
      func: jest.fn()
    };
    const stateProxy = createWritableState(component, state);
    const event = new Event('click');
    const loopContext: ILoopContext = {
      // mock loopContext properties and methods if necessary
      indexes: [1,2,3],
      find: jest.fn()
    } as unknown as ILoopContext;
    (loopContext.find as jest.Mock).mockReturnValue(undefined);
    stateProxy[DirectryCallApiSymbol]("func", loopContext, event);
    expect(state.func).toHaveBeenCalledWith(event, 1, 2, 3);
  });

  it('should directly call callback with loop', async () => {
    const stateClass = class {
      values = [4,5,6];
      func(event: Event, ...indexes: number[]) {
        expect(indexes).toEqual([1]);
        // @ts-ignore
        expect(this["values.*"]).toEqual(5);
        // @ts-ignore
        expect(this["values.0"]).toEqual(4);
        // @ts-ignore
        expect(this["values.1"]).toEqual(5);
        // @ts-ignore
        expect(this["values.2"]).toEqual(6);
      }
    };
    const state = new stateClass
    const stateProxy = createWritableState(component, state);
    const event = new Event('click');
    const loopContext: ILoopContext = {
      // mock loopContext properties and methods if necessary
      indexes: [1],
      find: jest.fn()
    } as unknown as ILoopContext;
    (loopContext.find as jest.Mock).mockReturnValue({indexes: [1]});
    stateProxy[DirectryCallApiSymbol]("func", loopContext, event);
    expect(loopContext.find).toHaveBeenCalledWith("values.*");
  });
/*
  it('should directly nested call callback with loop', async () => {
    const stateClass = class {
      values = [4,5,6];
      async func(event: Event, ...indexes: number[]) {
        const loopContext: ILoopContext = {
          // mock loopContext properties and methods if necessary
          indexes: [1],
          find: jest.fn()
        } as unknown as ILoopContext;
        (loopContext.find as jest.Mock).mockReturnValue({indexes: [1]});
        expect(async () => {
          // @ts-ignore
          await this[DirectryCallApiSymbol]("func2", loopContext, event);
        }).toThrow("Writable: already set loopContext");
      }
      func2(event: Event, ...indexes: number[]) {
      }
    };
    const state = new stateClass
    const stateProxy = createWritableState(component, state);
    const event = new Event('click');
    const loopContext: ILoopContext = {
      // mock loopContext properties and methods if necessary
      indexes: [1],
      find: jest.fn()
    } as unknown as ILoopContext;
    (loopContext.find as jest.Mock).mockReturnValue({indexes: [1]});
    await stateProxy[DirectryCallApiSymbol]("func", loopContext, event);
  });
*/  

});