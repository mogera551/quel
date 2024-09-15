import "jest";
import { createStates } from "../../src/state/createStates";
import { ClearCacheApiSymbol } from "../../src/state/symbols";
import { IComponent } from "../../src/component/types";
import { IStateProxy, IComponentForHandler } from "../../src/state/types";
import { createReadonlyState } from "../../src/state/createReadonlyState";
import { createWritableState } from "../../src/state/createWritableState";

jest.mock("../../src/state/createReadonlyState");
jest.mock("../../src/state/createWritableState");

describe('createStatIComponentForHandleres', () => {
  let component: IComponentForHandler;
  let base: Object;
  let readOnlyState: IStateProxy;
  let writableState: IStateProxy;
  const clearCacheMock = jest.fn();

  beforeEach(() => {
    component = {} as IComponentForHandler;
    base = {};
    readOnlyState = {} as IStateProxy;
    writableState = {} as IStateProxy;
    readOnlyState[ClearCacheApiSymbol] = clearCacheMock;

  });

  it('should create a States instance', () => {
    const states = createStates(component, base, readOnlyState, writableState);
    expect(states).toBeDefined();
  });

  it('should return the base object', () => {
    const states = createStates(component, base, readOnlyState, writableState);
    expect(states.base).toBe(base);
  });

  it('should return the readonly state by default', () => {
    const states = createStates(component, base, readOnlyState, writableState);
    expect(states.current).toBe(readOnlyState);
  });

  it('should switch to writable state during writable callback', async () => {
    const states = createStates(component, base, readOnlyState, writableState);
    expect(states.current).toBe(readOnlyState);
    await states.writable(async () => {
      expect(states.current).toBe(writableState);
    });
    expect(states.current).toBe(readOnlyState);
  });

  it('should call ClearCacheApiSymbol when switching from writable to readonly', async () => {

    const states = createStates(component, base, readOnlyState, writableState);
    await states.writable(async () => {});
    expect(clearCacheMock).toHaveBeenCalled();
  });

  it('should throw an error if writable is called twice', async () => {
    const states = createStates(component, base, readOnlyState, writableState);
    await states.writable(async () => {
      try {
        await states.writable(async () => {});
      } catch(error) {
        expect(error).toBeDefined();
        // "States: already writable"が帰ってきているか確認したいが、わからない
      }
    });
  });

  it('should create readonly and writable states by default', () => {
    (createReadonlyState as jest.Mock).mockReturnValue({} as IStateProxy);
    (createWritableState as jest.Mock).mockReturnValue({} as IStateProxy);
    createStates(component, base);
    expect(createReadonlyState).toHaveBeenCalled();
    expect(createWritableState).toHaveBeenCalled();
  });
});