
import { getProxies } from "../../src/state/Proxies";
import { DependenciesSymbol } from "../../src/state/Const";

describe("getProxies", () => {
  test("getProxies should return the correct proxies", () => {
    const state = {a:1, b:2};
    const component = document.createElement("div");
    const proxies = getProxies(component, state);
    const base = Object.assign({}, proxies.base);
    expect(base).toStrictEqual(state);
    const write = Object.assign({}, proxies.write);
    expect(write).toStrictEqual(state);
    const readonly = Object.assign({}, proxies.readonly);
    expect(readonly).toStrictEqual(state);
  });
  test("getProxies should return the correct proxies", () => {
    const state = {a:1, b:2, $dependentProps: {a: ["b"]}};
    const component = document.createElement("div");
    const proxies = getProxies(component, state);
    const base = Object.assign({}, proxies.base);
    expect(base).toStrictEqual(state);
    const write = Object.assign({}, proxies.write);
    expect(write).toStrictEqual(state);
    const readonly = Object.assign({}, proxies.readonly);
    expect(readonly).toStrictEqual(state);

    expect(proxies.base[DependenciesSymbol]).toStrictEqual({a: ["b"]});
  });

});