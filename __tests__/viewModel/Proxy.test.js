import { Component } from "../../src/component/Component.js";
import { dotNotation } from "../../modules/imports.js";
import { Cache } from "../../src/viewModel/Cache.js";
import { ViewModelHandler, createViewModel } from "../../src/viewModel/Proxy.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { GlobalData } from "../../src/global/Data.js";
import { DependentProps } from "../../src/viewModel/DependentProps.js";
import { ViewModelize } from "../../src/viewModel/ViewModelize.js";

class ViewModel {
  "aaa" = [10,20,30];
  "bbb" = true;
  "ccc" = 100;
  "ddd" = 200;
}

let calledAddProcess = false;
let calledAddNotify = [];
let calledAddNodeUpdate = [];
const updateSlot = {
  /**
   * 
   * @param {import("../../src/thread/ViewModelUpdator.js").ProcessData} processData 
   */
  addProcess: function(processData) {
    calledAddProcess = true;
  },
  addProcesses: function(processData) {
    calledAddProcess = true;
  },
  
  /**
   * 
   * @param {import("../../modules/dot-notation/dot-notation.js").PropertyAccess} notifyData 
   */
  addNotify: function(notifyData) {
    calledAddNotify.push(notifyData);
  },
  addNotifies: function(notifyData) {
    calledAddNotify.push(...notifyData);
  },

  /**
   * 
   * @param {NodeUpdateData} nodeUpdateData 
   */
  addNodeUpdate: function(nodeUpdateData) {
    calledAddNodeUpdate.push(nodeUpdateData);
  },
  addNodeUpdates: function(nodeUpdateData) {
    calledAddNodeUpdate.push(...nodeUpdateData);
  }
}
customElements.define("custom-tag", Component);
const parentComponent = document.createElement("custom-tag");
const component = document.createElement("custom-tag");
parentComponent.appendChild(component);

const dataViewModel = new ViewModel;
const viewModel = new Proxy(dataViewModel, new ViewModelHandler(parentComponent));

component.updateSlot = updateSlot;
parentComponent.viewModel = viewModel;
parentComponent.updateSlot = updateSlot;

test('Handler getByPropertyName', () => {
  class targetClass {
    "aaa" = 100;
    get "bbb"() {
      return 200;
    }
    "list" = [ 
      { value:10 }, { value:20 }, { value:30 }
    ];
    get "list.*.double"() {
      return this["list.*.value"] * 2;
    }
    method() {

    }

  }
  const target = new targetClass;
  const handler = new ViewModelHandler({name:"component"}, ["bbb", "list.*.double"], ["method"]);
  const proxy = new Proxy(target, handler);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("aaa") }, proxy)).toBe(100);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("bbb") }, proxy)).toBe(200);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("bbb") }, proxy)).toBe(200);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("ccc") }, proxy)).toBe(undefined);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("list") }, proxy)).toEqual(
    [ { value:10 }, { value:20 }, { value:30 } ]
  );
  handler.stackIndexes.push([0]);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("list.*.value") }, proxy)).toBe(10);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("list.*.double") }, proxy)).toBe(20);
  handler.stackIndexes.pop();
  handler.stackIndexes.push([1]);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("list.*.value") }, proxy)).toBe(20);
  expect(handler.getByPropertyName(target, { propName:dotNotation.PropertyName.create("list.*.double") }, proxy)).toBe(40);
  handler.stackIndexes.pop();
  expect(handler.methods).toEqual(["method"]);
  expect(handler.accessorProperties).toEqual(["bbb", "list.*.double"]);
  expect(handler.setOfAccessorProperties).toEqual(new Set(["bbb", "list.*.double"]));
  expect(handler.component).toEqual({name:"component"});
  expect(handler.cache instanceof Cache).toBe(true);

});

test('Handler get ArrayProxy', () => {
  class targetClass {
    "list" = [ 
      { value:10 }, { value:20 }, { value:30 }
    ];
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], []);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;

  const list = proxy["list"];
  expect(list?.[Symbols.isProxy]).toBe(true);
  expect(list?.[Symbols.getRaw]).toEqual(list);
  expect((list?.[Symbols.getRaw])?.[Symbols.isProxy]).toBe(undefined);
//  list.push({value:40});
});

test('Handler set ArrayProxy', () => {
  class targetClass {
    "list" = [ 
      { value:10 }, { value:20 }, { value:30 }
    ];
    "list2";
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], []);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;

  const list = proxy["list"];
  proxy["list2"] = proxy["list"];
  const list2 = proxy["list2"];
  expect(list2?.[Symbols.isProxy]).toBe(true);
  expect(list2?.[Symbols.getRaw]).toEqual(list2);
  expect((list2?.[Symbols.getRaw])?.[Symbols.isProxy]).toBe(undefined);
  expect(target.list2?.[Symbols.getRaw]).toBe(undefined);
  expect(target.list2).toEqual(list);
//  list.push({value:40});
});

test('Handler callback', () => {
  let calledAddProcess = false;
  const component = {
    updateSlot: {
      /**
       * 
       * @param {import("../../src/thread/ViewModelUpdator.js").ProcessData} proc 
       */
      addProcess: (proc) => {
        Reflect.apply(proc.target, proc.thisArgument, proc.argumentsList);
        calledAddProcess = true;
//        console.log("addProcess");
      }
    }
  };
  let initCallbacked = false;
  let connectedCallbacked = false;
  let disconnectedCallbacked = false;
  let writeCallbacked = undefined;
  class targetClass {
    $initCallback() {
      initCallbacked = true;
    }
    $connectedCallback() {
      connectedCallbacked = true;
    }
    $disconnectedCallback() {
      disconnectedCallbacked = true;
    }
    $writeCallback(name, indexes) {
      writeCallbacked = {name, indexes};
    }
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], [], []);
  const proxy = new Proxy(target, handler);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.initCallback]).toBe("function");
  proxy[Symbols.initCallback]();
  expect(initCallbacked).toBe(true);
  expect(calledAddProcess).toBe(false);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.connectedCallback]).toBe("function");
  proxy[Symbols.connectedCallback]();
  expect(connectedCallbacked).toBe(true);
  expect(calledAddProcess).toBe(true);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.disconnectedCallback]).toBe("function");
  proxy[Symbols.disconnectedCallback]();
  expect(disconnectedCallbacked).toBe(true);
  expect(calledAddProcess).toBe(true);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.writeCallback]).toBe("function");
  proxy[Symbols.writeCallback]("aaa", [1,2,3]);
  expect(writeCallbacked).toEqual({name:"aaa", indexes:[1,2,3]});
  expect(calledAddProcess).toBe(true);

});

test('Handler callback', () => {
  let initCallbacked = false;
  let connectedCallbacked = false;
  let disconnectedCallbacked = false;
  let writeCallbacked = undefined;
  class targetClass {
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], []);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;

  calledAddProcess = false;
  expect(typeof proxy[Symbols.initCallback]).toBe("function");
  proxy[Symbols.initCallback]();
  expect(initCallbacked).toBe(false);
  expect(calledAddProcess).toBe(false);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.connectedCallback]).toBe("function");
  proxy[Symbols.connectedCallback]();
  expect(connectedCallbacked).toBe(false);
  expect(calledAddProcess).toBe(false);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.disconnectedCallback]).toBe("function");
  proxy[Symbols.disconnectedCallback]();
  expect(disconnectedCallbacked).toBe(false);
  expect(calledAddProcess).toBe(false);

  calledAddProcess = false;
  expect(typeof proxy[Symbols.writeCallback]).toBe("function");
  proxy[Symbols.writeCallback]("aaa", [1,2,3]);
  expect(writeCallbacked).toBe(undefined);
  expect(calledAddProcess).toBe(false);

});

test('Handler drectlyCall', async () => {
  let calledMethod = undefined;
  class targetClass {
    method(event, $1, $2, $3) {
      calledMethod = { event, $1, $2, $3 };
    }

  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], ["method"]);
  const proxy = new Proxy(target, handler);

  calledMethod = undefined;
  await proxy[Symbols.directlyCall]("method", [1,2,3], {name:"event"});
  expect(calledMethod).toEqual({ event:{name:"event"}, $1:1, $2:2, $3:3 });
  await proxy[Symbols.directlyCall]("method", [4,5,6], {name:"event"});
  expect(calledMethod).toEqual({ event:{name:"event"}, $1:4, $2:5, $3:6 });
});

test('Proxy', async () => {
  class targetClass {
    "aaa" = 100;
    "bbb" = [10, 20, 30];
    "ccc" = [ { value:111 }, { value:222 } ];
    "fff" = [ 1,2,3 ];
    get "ccc.*.triple"() {
      return this["ccc.*.value"] * 3;
    }
    get "ddd"() {
      return this["aaa"] * 100;
    }
    $dependentProps = {
      "ddd": [ "aaa" ]
    }
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], [], target.$dependentProps);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;
  expect(proxy["aaa"]).toBe(100);
  expect(proxy["bbb"]).toEqual([10, 20, 30]);
  expect(proxy["bbb.0"]).toBe(10);
  expect(proxy["bbb.1"]).toBe(20);
  expect(proxy["bbb.2"]).toBe(30);
  expect(proxy["bbb.3"]).toBe(undefined);
  expect(proxy["ccc"]).toEqual([{ value:111 }, { value:222 }]);
  expect(proxy["ccc.0.value"]).toBe(111);
  expect(proxy["ccc.1.value"]).toBe(222);
  expect(proxy["ccc.0.triple"]).toBe(333);
  expect(proxy["ccc.1.triple"]).toBe(666);
  proxy["aaa"] = 1000;
  expect(proxy["aaa"]).toBe(1000);
  proxy["bbb.0"] = 11;
  expect(proxy["bbb.0"]).toBe(11);
  proxy["ccc.0.value"] = 1111;
  expect(proxy["ccc.0.value"]).toBe(1111);

  const $dependentProps = proxy[Symbols.getDependentProps]();
  expect($dependentProps instanceof DependentProps).toEqual(true);
  expect(Array.from($dependentProps.setOfPropsByRefProp.keys())).toEqual(["aaa", "bbb", "ccc.*", "ccc"]);
  expect(Array.from($dependentProps.setOfPropsByRefProp.get("aaa"))).toEqual(["ddd"]);
  expect(Array.from($dependentProps.setOfPropsByRefProp.get("bbb"))).toEqual(["bbb.*"]);
  expect(Array.from($dependentProps.setOfPropsByRefProp.get("ccc"))).toEqual(["ccc.*"]);
  expect(Array.from($dependentProps.setOfPropsByRefProp.get("ccc.*"))).toEqual(["ccc.*.value", "ccc.*.triple"]);

  proxy["fff.0"] = 11;
  expect(proxy["fff.0"]).toBe(11);

  const $handler = proxy[Symbols.getHandler]();
  expect($handler).toBe(handler);
});

test('Proxy $props', async () => {
  
  class targetClass {
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], []);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;
  component.props[Symbols.bindProperty]("CCC", "ccc", []);
  component.props[Symbols.bindProperty]("AAA", "aaa.*", [0]);
  expect(proxy["$props.CCC"]).toBe(100);
  proxy["$props.CCC"] = 2000;
  expect(proxy["$props.CCC"]).toBe(2000);
  expect(component.parentComponent.viewModel["ccc"]).toBe(2000);

  expect(proxy["$props.AAA"]).toBe(10);
  proxy["$props.AAA"] = 1000;
  expect(proxy["$props.AAA"]).toBe(1000);
  expect(component.parentComponent.viewModel["aaa.0"]).toBe(1000);
  expect(dataViewModel["aaa"][0]).toBe(1000);
});

test('Proxy $globals', async () => {
  Object.assign(GlobalData.data, {
    "aaa":100,
    "bbb": [1,2,3]
  });
  
  class targetClass {
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], []);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;
  expect(proxy["$globals.aaa"]).toBe(100);
  expect(proxy["$globals.bbb"]).toEqual([1,2,3]);
  expect(proxy["$globals.bbb.0"]).toBe(1);
  expect(proxy["$globals.bbb.1"]).toBe(2);
  expect(proxy["$globals.bbb.2"]).toBe(3);
  expect(proxy["$globals.bbb.3"]).toBe(undefined);
  expect(proxy[Symbols.directlyGet]("$globals.bbb.*", [0])).toBe(1);
  expect(proxy[Symbols.directlyGet]("$globals.bbb.*", [1])).toBe(2);
  expect(proxy[Symbols.directlyGet]("$globals.bbb.*", [2])).toBe(3);

  proxy["$globals.aaa"] = 200;
  expect(proxy["$globals.aaa"]).toBe(200);
  expect(GlobalData.data.aaa).toBe(200);
  proxy["$globals.bbb"] = [4,5];
  expect(proxy["$globals.bbb"]).toEqual([4,5]);
  expect(proxy["$globals.bbb.0"]).toBe(4);
  expect(proxy["$globals.bbb.1"]).toBe(5);
  expect(proxy["$globals.bbb.2"]).toBe(undefined);
  expect(GlobalData.data.bbb).toEqual([4,5]);
  expect(GlobalData.data["bbb.0"]).toEqual(4);
  expect(GlobalData.data["bbb.1"]).toEqual(5);
  proxy["$globals.bbb.0"] = 14;
  expect(proxy["$globals.bbb.0"]).toBe(14);
  proxy["$globals.bbb.1"] = 15;
  expect(proxy["$globals.bbb.1"]).toBe(15);
  expect(proxy["$globals.bbb"]).toEqual([14,15]);
  expect(GlobalData.data.bbb).toEqual([14,15]);
  proxy["$globals.bbb.2"] = 16;
  expect(proxy["$globals.bbb.2"]).toBe(16);
  expect(proxy["$globals.bbb"]).toEqual([14,15,16]);
  expect(GlobalData.data.bbb).toEqual([14,15,16]);
});

test("Handler ", () => {
  class ViewModel {
    "aaa" = 100;
    "bbb" = [
      [ 10, 20, 30, 40 ],
      [ 10, 20, 30, 40 ],
      [ 10, 20, 30, 40 ],
    ];
    "ccc" = [
      { value:111 }
    ];
  }
  const proxyViewModel = createViewModel(component, ViewModel);
  component.viewModel = proxyViewModel;

  const listOfIndexes1 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
  expect(listOfIndexes1).toEqual([[]]);

  const listOfIndexes4 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1, 1] });
  expect(listOfIndexes4).toEqual([[1,1]]);

  const listOfIndexes2 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[] });
  expect(listOfIndexes2).toEqual([
    [0,0],
    [0,1],
    [0,2],
    [0,3],
    [1,0],
    [1,1],
    [1,2],
    [1,3],
    [2,0],
    [2,1],
    [2,2],
    [2,3],
  ]);

  const listOfIndexes3 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1] } );
  expect(listOfIndexes3).toEqual([[1,0] ,[1,1], [1,2], [1,3]]);

  const listOfIndexes5 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1,2,3] } );
  expect(listOfIndexes5).toEqual([[1,2]]);

  const listOfIndexes6 = ViewModelHandler.expandIndexes(proxyViewModel, { propName:dotNotation.PropertyName.create("ccc.*.vaue"), indexes:[] } );
  expect(listOfIndexes6).toEqual([[0]]);
});

test('Handler makeNotifyForDependentProps', () => {
  class ViewModel {
    "aaa" = 100;
    "bbb" = [
      [ 10, 20, 30, 40 ],
      [ 10, 20, 30, 40 ],
      [ 10, 20, 30, 40 ],
    ];
    get "ccc"() {
      return this["aaa"] * 100;
    }
    "ddd" = 1000;
    get "eee"() {
      return 200;
    }
    get "fff"() {
      return 100;
    }
    $dependentProps = {
      "ccc": [ "aaa" ],
      "eee": [ "fff" ],
      "fff": [ "eee" ],
    };
  }
  const proxyViewModel = createViewModel(component, ViewModel);
  const d1 = proxyViewModel["aaa"];
  const d2 = proxyViewModel["bbb"];
  const d3 = proxyViewModel["bbb.*"];
  const d4 = proxyViewModel["bbb.*.*"];
  component.viewModel = proxyViewModel;

  calledAddNotify = [];
  
  const notifies = ViewModelHandler.makeNotifyForDependentProps(proxyViewModel, { propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
  expect(notifies).toEqual([
    { propName:dotNotation.PropertyName.create("ccc"), indexes:[] }
  ])

  const notifies2 = ViewModelHandler.makeNotifyForDependentProps(proxyViewModel, { propName:dotNotation.PropertyName.create("bbb"), indexes:[] });
  expect(notifies2).toEqual([
    { propName:dotNotation.PropertyName.create("bbb.*"), indexes:[0] },
    { propName:dotNotation.PropertyName.create("bbb.*"), indexes:[1] },
    { propName:dotNotation.PropertyName.create("bbb.*"), indexes:[2] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[0,0] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[0,1] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[0,2] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[0,3] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1,0] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1,1] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1,2] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[1,3] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[2,0] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[2,1] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[2,2] },
    { propName:dotNotation.PropertyName.create("bbb.*.*"), indexes:[2,3] },
  ])

  const notifies3 = ViewModelHandler.makeNotifyForDependentProps(proxyViewModel, { propName:dotNotation.PropertyName.create("eee"), indexes:[] });
  expect(notifies3).toEqual([
    { propName:dotNotation.PropertyName.create("fff"), indexes:[] },
    { propName:dotNotation.PropertyName.create("eee"), indexes:[] },
  ]);

  const notifies4 = ViewModelHandler.makeNotifyForDependentProps(proxyViewModel, { propName:dotNotation.PropertyName.create("fff"), indexes:[] });
  expect(notifies4).toEqual([
    { propName:dotNotation.PropertyName.create("eee"), indexes:[] },
    { propName:dotNotation.PropertyName.create("fff"), indexes:[] },
  ]);
  //console.log(notifies2);
});

test('Proxy Array', () => {
  class ViewModel {
    "aaa" = [ 100, 200, 300 ];
    "bbb" = [
      [1,2]
    ]
  }
  const proxyViewModel = createViewModel(component, ViewModel);
  component.viewModel = proxyViewModel;

  const array = proxyViewModel["aaa"];
  calledAddNotify = [];
  array.push(400);
  expect(array[Symbols.isProxy]).toBe(true);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([100, 200, 300, 400]);

  calledAddNotify = [];
  const value1 = array.pop();
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([100, 200, 300]);
  expect(value1).toBe(400);

  calledAddNotify = [];
  array.unshift(0);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([0, 100, 200, 300]);

  calledAddNotify = [];
  const value2 = array.shift();
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([100, 200, 300]);
  expect(value2).toBe(0);

  calledAddNotify = [];
  const value3 = array.splice(1, 1);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([100, 300]);
  expect(value3).toEqual([200]);

  calledAddNotify = [];
  const value4 = array.splice(1, 1, 400, 500);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("aaa"));
  expect(calledAddNotify[0].indexes).toEqual([]);
  expect(array).toEqual([100, 400, 500]);
  expect(value4).toEqual([300]);

  calledAddNotify = [];
  const bbb0 = proxyViewModel["bbb.0"];
  bbb0.push(3);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("bbb.*"));
  expect(calledAddNotify[0].indexes).toEqual([0]);
  expect(bbb0).toEqual([1,2,3]);
  expect(proxyViewModel["bbb.0"]).toEqual([1,2,3]);

  calledAddNotify = [];
  const bbb0_ = proxyViewModel[Symbols.directlyGet]("bbb.*", [0]);
  expect(bbb0_[Symbols.isProxy]).toBe(true);
  bbb0_.push(4);
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("bbb.*"));
  expect(calledAddNotify[0].indexes).toEqual([0]);
  expect(bbb0_).toEqual([1,2,3,4]);
  expect(proxyViewModel["bbb.0"]).toEqual([1,2,3,4]);

  calledAddNotify = [];
  const $handler = proxyViewModel[Symbols.getHandler]();
  $handler.stackIndexes.push([0]);
  expect(proxyViewModel["bbb.*"]).toEqual([1,2,3,4]);
  proxyViewModel["bbb.*"].push(5);
  expect(proxyViewModel["bbb.*"]).toEqual([1,2,3,4,5]);
  $handler.stackIndexes.pop();
  expect(calledAddNotify.length).toBe(1);
  expect(calledAddNotify[0].propName).toEqual(dotNotation.PropertyName.create("bbb.*"));
  expect(calledAddNotify[0].indexes).toEqual([0]);

  //proxyViewModel.
});

test('Proxy $dependentProps', async () => {
  class targetClass {
    $dependentProps = {
      "aaa": ["bbb", "ccc"],
    }
  }
  const target = new targetClass;
  const handler = new ViewModelHandler(component, [], [], target.$dependentProps);
  const proxy = new Proxy(target, handler);
  component.viewModel = proxy;

  expect(proxy["$dependentProps"]).toEqual({
    "aaa": ["bbb", "ccc"],
  });
});

test('Proxy Cache', () => {
  let calledCache = true;
  class ViewModel {
    "aaa" = 100;
    get "bbb"() {
      calledCache = false;
      return this["aaa"] * 2;
    }
    "ccc" = [500];
    get "ddd.*"() {
      calledCache = false;
      return this["ccc.*"] / 2;
    }
  }
  const proxyViewModel = createViewModel(component, ViewModel);
  component.viewModel = proxyViewModel;

  const handler = proxyViewModel[Symbols.getHandler]();
  expect(handler.accessorProperties).toEqual(["bbb", "ddd.*"]);
  expect(proxyViewModel[Symbols.beCacheable]()).toBe(true);
  expect(handler.cacheable).toBe(true);
  calledCache = true;
  expect(proxyViewModel["bbb"]).toBe(200);
  expect(calledCache).toBe(false);
  calledCache = true;
  expect(proxyViewModel["bbb"]).toBe(200);
  expect(calledCache).toBe(true);

  proxyViewModel[Symbols.beUncacheable]();
  expect(handler.cacheable).toBe(false);
  
  proxyViewModel[Symbols.beCacheable]();
  expect(handler.cacheable).toBe(true);
  calledCache = true;
  expect(proxyViewModel["bbb"]).toBe(200);
  expect(calledCache).toBe(false);
  calledCache = true;
  expect(proxyViewModel["bbb"]).toBe(200);
  expect(calledCache).toBe(true);

  calledCache = true;
  handler.stackIndexes.push([0, 1]);
  expect(proxyViewModel["ddd.*"]).toBe(250);
  expect(calledCache).toBe(false);
  handler.stackIndexes.pop();

  calledCache = true;
  handler.stackIndexes.push([0, 1]);
  expect(proxyViewModel["ddd.*"]).toBe(250);
  expect(calledCache).toBe(true);
  handler.stackIndexes.pop();
});