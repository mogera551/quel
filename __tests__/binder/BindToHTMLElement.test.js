//import { Component } from "../../src/component/Component.js";
import { BindToHTMLElement } from "../../src/binder/BindToHTMLElement.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { Event as EventBind } from "../../src/bindInfo/Event.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";

test("BindToHTMLElement div", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[0].node.textContent).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.textContent = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
});

test("BindToHTMLElement input ", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("value");
  expect(binds[0].nodePropertyElements).toEqual(["value"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToHTMLElement select ", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLSelectElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("value");
  expect(binds[0].nodePropertyElements).toEqual(["value"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToHTMLElement textarea ", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLTextAreaElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("value");
  expect(binds[0].nodePropertyElements).toEqual(["value"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
});

test("BindToHTMLElement input defaultEvent", () => {
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
    [Symbols.directlyCall](viewModelProperty, context, event) {
      if (typeof context !== "undefined") {
        try {
          return Reflect.apply(this[viewModelProperty], this, [event, ...context.indexes]);
        } finally {
        }
      } else {
        try {
          return Reflect.apply(this[viewModelProperty], this, [event]);
        } finally {
        }
      }
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("value");
  expect(binds[0].nodePropertyElements).toEqual(["value"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof EventBind).toBe(true);
  expect(binds[1].node).toBe(node);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].element).toBe(node);
  expect(binds[1].nodeProperty).toBe("oninput");
  expect(binds[1].nodePropertyElements).toEqual(["oninput"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("change");
  expect(binds[1].viewModelPropertyName).toBe(PropertyName.create("change"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("change\t");
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].lastNodeValue).toBe(undefined);
  expect(binds[1].lastViewModelValue).toBe(undefined);
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });

  calledChange = false;
  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
  expect(calledChange).toBe(true);
});

test("BindToHTMLElement input no defaultEvent", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("value");
  expect(binds[0].nodePropertyElements).toEqual(["value"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof EventBind).toBe(true);
  expect(binds[1].node).toBe(node);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].element).toBe(node);
  expect(binds[1].nodeProperty).toBe("onclick");
  expect(binds[1].nodePropertyElements).toEqual(["onclick"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("change");
  expect(binds[1].viewModelPropertyName).toBe(PropertyName.create("change"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("change\t");
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].lastNodeValue).toBe(undefined);
  expect(binds[1].lastViewModelValue).toBe(undefined);
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });

  calledChange = false;
  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
  expect(calledChange).toBe(false);
});

test("BindToHTMLElement input radio", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].node.checked).toBe(true);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("checked");
  expect(binds[0].nodePropertyElements).toEqual(["checked"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe(true);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.checked = false;
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe(false);
});

test("BindToHTMLElement input checkbox", () => {
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
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].node.checked).toBe(true);
  expect(binds[0].element).toBe(node);
  expect(binds[0].nodeProperty).toBe("checked");
  expect(binds[0].nodePropertyElements).toEqual(["checked"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe(true);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  node.checked = false;
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe(false);
});

test("BindToHTMLElement not element", () => {
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
  expect(() => {const binds = BindToHTMLElement.bind(node, component, null, [])}).toThrow();
});

/**
 * ToDo: radio
 * ToDo: checkbox
 */