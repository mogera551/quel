import { BindingSummary } from "../../src/binding/BindingSummary.js";
import { NodeProperty } from "../../src/binding/nodeProperty/NodeProperty.js";
import { ComponentProperty } from "../../src/binding/nodeProperty/ComponentProperty";

describe("BindingSummary", () => {
  let bindingSummary;

  beforeEach(() => {
    bindingSummary = new BindingSummary();
  });

  afterEach(() => {
    bindingSummary.clear();
  });

  test("should add a binding, witout expandable, no ComponentProperty", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: false,
        constructor: NodeProperty
      }
    };
    expect(bindingSummary.updatedBindings.size).toBe(0);
    expect(bindingSummary.allBindings.size).toBe(0);
    expect(bindingSummary.expandableBindings.size).toBe(0);
    expect(bindingSummary.componentBindings.size).toBe(0);
    expect(bindingSummary.bindingsByKey.get("key1")).toBe(undefined);
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    expect(bindingSummary.expandableBindings.size).toBe(0);
    expect(bindingSummary.componentBindings.size).toBe(0);

  });

  test("should add a binding, with expandable, no ComponentProperty", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: true,
        constructor: NodeProperty
      }
    };
    expect(bindingSummary.allBindings.size).toBe(0);
    expect(bindingSummary.expandableBindings.size).toBe(0);
    expect(bindingSummary.componentBindings.size).toBe(0);
    expect(bindingSummary.bindingsByKey.get("key1")).toBe(undefined);
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    expect(bindingSummary.expandableBindings.size).toBe(1);
    expect(bindingSummary.componentBindings.size).toBe(0);
  });

  test("should add a binding, with expandable, with ComponentProperty", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: true,
        constructor: ComponentProperty
      }
    };
    expect(bindingSummary.allBindings.size).toBe(0);
    expect(bindingSummary.expandableBindings.size).toBe(0);
    expect(bindingSummary.componentBindings.size).toBe(0);
    expect(bindingSummary.bindingsByKey.get("key1")).toBe(undefined);
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    expect(bindingSummary.expandableBindings.size).toBe(1);
    expect(bindingSummary.componentBindings.size).toBe(1);
    bindingSummary.delete(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    expect(bindingSummary.expandableBindings.size).toBe(1);
    expect(bindingSummary.componentBindings.size).toBe(1);
    bindingSummary.flush();
    expect(bindingSummary.allBindings.size).toBe(0);
    expect(bindingSummary.expandableBindings.size).toBe(0);
    expect(bindingSummary.componentBindings.size).toBe(0);
    expect(bindingSummary.bindingsByKey.get("key1")).toBe(undefined);

  });

  test("should delete a binding, flush", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: false,
        constructor: NodeProperty
      }
    };
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    bindingSummary.delete(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    bindingSummary.flush();
    expect(bindingSummary.allBindings.size).toBe(0);
    expect(bindingSummary.bindingsByKey.get("key1")).toBe(undefined);
  });

  test("should delete a binding, add, and flush", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: false,
        constructor: NodeProperty
      }
    };
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    bindingSummary.delete(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    bindingSummary.add(binding);
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
    bindingSummary.flush();
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([binding]));
  });

  test("should flush, case of delete binding >= remain bindings * 10  ", () => {
    let lastBinding = null;
    for(let i = 0; i < 11; i++) {
      const binding = {
        viewModelProperty: {
          key: "key1"
        },
        nodeProperty: {
          expandable: false,
          constructor: NodeProperty
        }
      };
      bindingSummary.add(binding);
      lastBinding = binding;
    }
    const deleteBindings = Array.from(bindingSummary.allBindings).filter((_, index) => index < 10);
    deleteBindings.forEach(binding => bindingSummary.delete(binding));
    bindingSummary.flush();
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([lastBinding]));
  });

  test("should flush, case of delete binding < remain bindings * 10  ", () => {
    let lastBinding = null;
    for(let i = 0; i < 12; i++) {
      const binding = {
        viewModelProperty: {
          key: "key1"
        },
        nodeProperty: {
          expandable: false,
          constructor: NodeProperty
        }
      };
      bindingSummary.add(binding);
      lastBinding = binding;
    }
    const deleteBindings = Array.from(bindingSummary.allBindings).filter((_, index) => index < 11);
    deleteBindings.forEach(binding => bindingSummary.delete(binding));
    bindingSummary.flush();
    expect(bindingSummary.allBindings.size).toBe(1);
    expect(bindingSummary.bindingsByKey.get("key1")).toEqual(new Set([lastBinding]));
  });

  test("should rebuild bindings", () => {
    const bindings = [];
    for(let i = 0; i < 10; i++) {
      const binding = {
        viewModelProperty: {
          key: "key1"
        },
        nodeProperty: {
          expandable: false,
          constructor: NodeProperty
        }
      };
      bindings.push(binding);
    }
    bindingSummary.rebuild(bindings);
    expect(bindingSummary.allBindings.size).toBe(bindings.length);
    bindingSummary.rebuild(bindings.filter((_, index) => index < 5));
    expect(bindingSummary.allBindings.size).toBe(5);
  });

  test("should clear all bindings", () => {
    const binding = {
      viewModelProperty: {
        key: "key1"
      },
      nodeProperty: {
        expandable: false,
        constructor: NodeProperty
      }
    };
    bindingSummary.add(binding);
    bindingSummary.clear();
    expect(bindingSummary.allBindings.size).toBe(0);
  });
});
