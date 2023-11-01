import { Symbols } from "../../../src/Symbols.js";
import { ViewModelProperty } from "../../../src/binding/viewModelProperty/ViewModelProperty.js";
import { ComponentProperty } from "../../../src/binding/nodeProperty/ComponentProperty.js";
import { createProps } from "../../../src/component/Props.js";

const binding = {

};

/** @type {Component} */
const component = {
  filters: {
    in:{},
    out:{},
  },
  updateSlot:{
    addNodeUpdate:(update) => {
      Reflect.apply(update.updateFunc, update, []);
    },
    addProcess:(process) => {
      Reflect.apply(process.target, process.thisArgument, process.argumentsList);
    },
  },
  props: createProps(this),
};

test("ComponentProperty", () => {
  const callStack = [];
  const childComponentBase = {
    filters: {
      in:{},
      out:{},
    },
    updateSlot:{
      addNodeUpdate:(update) => {
        Reflect.apply(update.updateFunc, update, []);
      },
      addProcess:(process) => {
        Reflect.apply(process.target, process.thisArgument, process.argumentsList);
      },
    },
    [Symbols.isComponent]:true,
    viewModel: {
      get $props() {
        return childComponentBase.props;
      },
      [Symbols.writeCallback]: function (prop, indexes) {
        callStack.push({name:"writeCallback", prop, indexes});
      },
      [Symbols.notifyForDependentProps]: function (prop, indexes) {
        callStack.push({name:"notifyForDependentProps", prop, indexes});
      },
    },
    parentComponent: component,
  };
  childComponentBase.props = createProps(childComponentBase);
  component.viewModel = {
    aaa:100,
    ccc:[10, 20, 30],
    ddd:{
      e1: [100,200,300],
      e2: [101,202,303],
    },
    [Symbols.directlyGet]: function(prop, indexes) {
      console.log(prop, indexes);
      const props = prop.split(".");
      if (props.length == 2 ) {
        return (indexes.length > 0) ? this[props[0]][props[1]][indexes[0]] : this[props[0]][props[1]];

      } else if (props.length == 1) {
        return (indexes.length > 0) ? this[prop][indexes[0]] : this[prop];
      }
    },
    [Symbols.directlySet]: function(prop, indexes, value) {
      const props = prop.split(".");
      if (props.length == 2 ) {
        if (indexes.length > 0) {
          this[props[0]][props[1]][indexes[0]] = value;
        } else {
          this[props[0]][props[1]] = value;
        }
      } else if (props.length == 1) {
        if (indexes.length > 0) {
          this[prop][indexes[0]] = value;
        } else {
          this[prop] = value;
        }
      }
      return true;
    }
  };
  const div = document.createElement("div");
  const childComponent = Object.assign(div, childComponentBase);
  const componentProperty = new ComponentProperty(binding, childComponent, "props.bbb", [], {});
  expect(componentProperty.binding).toBe(binding);
  expect(componentProperty.node).toBe(childComponent);
  expect(componentProperty.element).toBe(childComponent);
  expect(componentProperty.name).toBe("props.bbb");
  expect(componentProperty.nameElements).toEqual(["props", "bbb"]);
  expect(componentProperty.propName).toBe("bbb");
  expect(componentProperty.filters).toEqual([]);
  expect(componentProperty.filterFuncs).toEqual({});
  expect(componentProperty.applicable).toBe(false);
  expect(componentProperty.expandable).toBe(false);
  expect(componentProperty.thisComponent).toBe(childComponent);

  {
    const viewModelProperty = new ViewModelProperty(binding, component.viewModel, "aaa", [], {});
    binding.viewModelProperty = viewModelProperty;
    componentProperty.initialize();
    const desc = Object.getOwnPropertyDescriptor(childComponent.viewModel, "bbb");
    expect(typeof desc.get).toBe("function");
    expect(typeof desc.set).toBe("function");
    expect(desc.enumerable).toBe(false);
    expect(desc.configurable).toBe(true);
    expect(childComponent.viewModel.bbb).toBe(100);
    childComponent.viewModel.bbb = 200;
    expect(component.viewModel.aaa).toBe(200);

    callStack.splice(0);
    componentProperty.beforeUpdate(["aaa\t"]);
    expect(callStack.length).toBe(4);
    expect(callStack[0]).toEqual({name:"writeCallback", prop:"$props.bbb", indexes:[]});
    expect(callStack[1]).toEqual({name:"writeCallback", prop:"bbb", indexes:[]});
    expect(callStack[2]).toEqual({name:"notifyForDependentProps", prop:"$props.bbb", indexes:[]});
    expect(callStack[3]).toEqual({name:"notifyForDependentProps", prop:"bbb", indexes:[]});
  }
  {
    const viewModelProperty = new ViewModelProperty(binding, component.viewModel, "ccc", [], {});
    binding.viewModelProperty = viewModelProperty;
    binding.contextParam = { indexes:[0] };
    componentProperty.initialize();
    expect(childComponent.viewModel.bbb).toBe(10);
    childComponent.viewModel.bbb = 11;
    expect(component.viewModel.ccc[0]).toBe(11);

    callStack.splice(0);
    componentProperty.beforeUpdate(["ccc\t"]);
    expect(callStack.length).toBe(4);
    expect(callStack[0]).toEqual({name:"writeCallback", prop:"$props.bbb", indexes:[]});
    expect(callStack[1]).toEqual({name:"writeCallback", prop:"bbb", indexes:[]});
    expect(callStack[2]).toEqual({name:"notifyForDependentProps", prop:"$props.bbb", indexes:[]});
    expect(callStack[3]).toEqual({name:"notifyForDependentProps", prop:"bbb", indexes:[]});
  }
  {
    const viewModelProperty = new ViewModelProperty(binding, component.viewModel, "ddd", [], {});
    binding.viewModelProperty = viewModelProperty;
    binding.contextParam = { indexes:[] };
    componentProperty.initialize();
    expect(childComponent.viewModel.bbb).toEqual({e1:[100,200,300],e2:[101,202,303]});
  }
  {
    const viewModelProperty = new ViewModelProperty(binding, component.viewModel, "ddd.e1", [], {});
    binding.viewModelProperty = viewModelProperty;
    binding.contextParam = { indexes:[] };
    componentProperty.initialize();
    expect(childComponent.viewModel.bbb).toEqual([100,200,300]);
    componentProperty.beforeUpdate(["ddd\t"]);
    expect(callStack[0]).toEqual({name:"writeCallback", prop:"$props.bbb", indexes:[]});
    expect(callStack[1]).toEqual({name:"writeCallback", prop:"bbb", indexes:[]});
    expect(callStack[2]).toEqual({name:"notifyForDependentProps", prop:"$props.bbb", indexes:[]});
    expect(callStack[3]).toEqual({name:"notifyForDependentProps", prop:"bbb", indexes:[]});
  }
});

test("ComponentProperty fail", () => {
  expect(() => {
    const componentProperty = new ComponentProperty(binding, {}, "props.bbb", [], {});
  }).toThrow("not Component");
});
