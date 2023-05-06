import { Component } from "../../src/component/Component.js";
import { BindToElement } from "../../src/binder/BindToElement.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { Event as EventBind } from "../../src/bindInfo/Event.js";

test("BindToElement div", () => {
  const node = document.createElement("div");
  node.dataset.bind = "aaa";
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.textContent).toBe("100");
  node.textContent = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
});

test("BindToElement input ", () => {
  const node = document.createElement("input");
  node.dataset.bind = "aaa";
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.value).toBe("100");

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToElement select ", () => {
  const node = document.createElement("select");
  const option1 = document.createElement("option");
  option1.value = "100";
  option1.textContent = "100";
  node.appendChild(option1);
  const option2 = document.createElement("option");
  option2.value = "200";
  option2.textContent = "100";
  node.dataset.bind = "aaa";
  node.appendChild(option2);
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.value).toBe("100");

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToElement textarea ", () => {
  const node = document.createElement("textarea");
  node.dataset.bind = "aaa";
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.value).toBe("100");

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToElement input defaultEvent", () => {
  const node = document.createElement("input");
  node.dataset.bind = "aaa; oninput:change";
  let calledChange = false;
  const viewModel = {
    "aaa": "100",
    change() {
      calledChange = true;
    },
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    },
    [Symbols.directlyCall](viewModelProperty, indexes, event) {
      Reflect.apply(this[viewModelProperty], this, [event, ...indexes]);
    },
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);
      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
     Object.assign(new EventBind, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.event,
      lastViewModelValue:undefined, lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.value).toBe("100");

  calledChange = false;
  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
  expect(calledChange).toBe(true);
});

test("BindToElement input no defaultEvent", () => {
  const node = document.createElement("input");
  node.dataset.bind = "aaa; onclick:change";
  let calledChange = false;
  const viewModel = {
    "aaa": "100",
    change() {
      calledChange = true;
    },
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    },
    [Symbols.directlyCall](viewModelProperty, indexes, event) {
      Reflect.apply(this[viewModelProperty], this, [event, ...indexes]);
    },
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);
      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:"100", lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
     Object.assign(new EventBind, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.event,
      lastViewModelValue:undefined, lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.value).toBe("100");

  calledChange = false;
  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
  expect(calledChange).toBe(false);
});

test("BindToElement input radio", () => {
  const node = document.createElement("input");
  node.type = "radio";
  node.value = "100";
  node.dataset.bind = "aaa";
  const viewModel = {
    "aaa": true,
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:true, lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.checked).toBe(true);

  node.checked = false;
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe(false);
});

test("BindToElement input checkbox", () => {
  const node = document.createElement("input");
  node.type = "checkbox";
  node.value = "100";
  node.dataset.bind = "aaa";
  const viewModel = {
    "aaa": true,
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  const binds = BindToElement.bind(node, component, null, []);
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, viewModel, filters:[], contextIndexes:[], indexes:[], eventType:undefined, type:NodePropertyType.levelTop,
      lastViewModelValue:true, lastNodeValue:undefined,
      contextBind:null, parentContextBind:null, positionContextIndexes:-1,
     }),
  ]);
  expect(node.checked).toBe(true);

  node.checked = false;
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe(false);
});

test("BindToElement not element", () => {
  const node = document.createTextNode("aaaa");
  const viewModel = {
    "aaa": "100",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      this[viewModelProperty] = value;
    }
  }
  const component = { 
    viewModel,
    updateSlot: {
      /**
       * 
       * @param {NodeUpdateData} nodeUpdateData 
       */
      addNodeUpdate(nodeUpdateData) {
        nodeUpdateData.updateFunc();
      },
      /**
       * 
       * @param {ProcessData} processData 
       */
      addProcess(processData) {
        Reflect.apply(processData.target, processData.thisArgument, processData.argumentsList);

      },
    }
  };
  expect(() => {const binds = BindToElement.bind(node, component, null, [])}).toThrow();
});

/**
 * ToDo: radio
 * ToDo: checkbox
 */