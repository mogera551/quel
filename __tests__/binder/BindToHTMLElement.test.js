//import { Component } from "../../src/component/Component.js";
import { BindToHTMLElement } from "../../src/binder/BindToHTMLElement.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { Event as EventBind } from "../../src/bindInfo/Event.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { Radio } from "../../src/bindInfo/Radio.js";
import { Checkbox } from "../../src/bindInfo/Checkbox.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";

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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[0].node.textContent).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLSelectElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLTextAreaElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof EventBind).toBe(true);
  expect(binds[1].node).toBe(node);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
    };
  const binds = BindToHTMLElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof EventBind).toBe(true);
  expect(binds[1].node).toBe(node);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].element).toBe(node);
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
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
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
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
  expect(binds[0].htmlElement).toBe(node);
  expect(() => binds[0].svgElement).toThrow();
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

test("BindToHTMLElement input radio", () => {
  const node1 = document.createElement("input");
  node1.type = "radio";
  node1.value = "100";
  node1.dataset.bind = "radio:aaa";
  const node2 = document.createElement("input");
  node2.type = "radio";
  node2.value = "200";
  node2.dataset.bind = "radio:aaa";
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  };
  const binds = [];
  const binds1 = BindToHTMLElement.bind(node1, component, { indexes:[], stack:[] });
  const binds2 = BindToHTMLElement.bind(node2, component, { indexes:[], stack:[] });
  binds.push(...binds1);
  binds.push(...binds2);
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof Radio).toBe(true);
  expect(binds[0].node).toBe(node1);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].node.checked).toBe(true);
  expect(binds[0].element).toBe(node1);
  expect(binds[0].htmlElement).toBe(node1);
  expect(() => binds[0].svgElement).toThrow();
  expect(binds[0].nodeProperty).toBe("radio");
  expect(binds[0].nodePropertyElements).toEqual(["radio"]);
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
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof Radio).toBe(true);
  expect(binds[1].node).toBe(node2);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].node.value).toBe("200");
  expect(binds[1].node.checked).toBe(false);
  expect(binds[1].element).toBe(node2);
  expect(binds[1].htmlElement).toBe(node2);
  expect(() => binds[1].svgElement).toThrow();
  expect(binds[1].nodeProperty).toBe("radio");
  expect(binds[1].nodePropertyElements).toEqual(["radio"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("aaa");
  expect(binds[1].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });

  node1.checked = false;
  node2.checked = true;
  const event = new Event('input');
  node2.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("200");
  node1.checked = true;
  node2.checked = false;
  node1.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
});

test("BindToHTMLElement input checkbox", () => {
  const node1 = document.createElement("input");
  node1.type = "checkbox";
  node1.value = "100";
  node1.dataset.bind = "checkbox:aaa";
  const node2 = document.createElement("input");
  node2.type = "checkbox";
  node2.value = "200";
  node2.dataset.bind = "checkbox:aaa";
  const viewModel = {
    "aaa": ["100"],
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
    },
    filters: {
      in:inputFilters,
      out:outputFilters,
    }
  };
  const binds = [];
  const binds1 = BindToHTMLElement.bind(node1, component, { indexes:[], stack:[] });
  const binds2 = BindToHTMLElement.bind(node2, component, { indexes:[], stack:[] });
  binds.push(...binds1);
  binds.push(...binds2);
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof Checkbox).toBe(true);
  expect(binds[0].node).toBe(node1);
  expect(binds[0].node instanceof HTMLInputElement).toBe(true);
  expect(binds[0].node.value).toBe("100");
  expect(binds[0].node.checked).toBe(true);
  expect(binds[0].element).toBe(node1);
  expect(binds[0].htmlElement).toBe(node1);
  expect(() => binds[0].svgElement).toThrow();
  expect(binds[0].nodeProperty).toBe("checkbox");
  expect(binds[0].nodePropertyElements).toEqual(["checkbox"]);
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
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof Checkbox).toBe(true);
  expect(binds[1].node).toBe(node2);
  expect(binds[1].node instanceof HTMLInputElement).toBe(true);
  expect(binds[1].node.value).toBe("200");
  expect(binds[1].node.checked).toBe(false);
  expect(binds[1].element).toBe(node2);
  expect(binds[1].htmlElement).toBe(node2);
  expect(() => binds[1].svgElement).toThrow();
  expect(binds[1].nodeProperty).toBe("checkbox");
  expect(binds[1].nodePropertyElements).toEqual(["checkbox"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("aaa");
  expect(binds[1].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });

  node1.checked = false;
  node2.checked = true;
  const event = new Event('input');
  node1.dispatchEvent(event);
  node2.dispatchEvent(event);
  expect(viewModel["aaa"]).toEqual(["200"]);

  node1.checked = true;
  node2.checked = false;
  node1.dispatchEvent(event);
  node2.dispatchEvent(event);
  expect(viewModel["aaa"]).toEqual(["100"]);

  node1.checked = true;
  node2.checked = true;
  node1.dispatchEvent(event);
  node2.dispatchEvent(event);
  expect(viewModel["aaa"]).toEqual(["100", "200"]);

  node1.checked = false;
  node2.checked = false;
  node1.dispatchEvent(event);
  node2.dispatchEvent(event);
  expect(viewModel["aaa"]).toEqual([]);
});

test("BindToHTMLElement input radio throw", () => {
  const node1 = document.createElement("input");
  node1.type = "checkbox";
  node1.value = "100";
  node1.dataset.bind = "radio:aaa";
  const node2 = document.createElement("input");
  node2.type = "checkbox";
  node2.value = "200";
  node2.dataset.bind = "radio:aaa";
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
  expect(() => {
    const binds1 = BindToHTMLElement.bind(node1, component, { indexes:[], stack:[] });
  }).toThrow("not radio");
  expect(() => {
    const binds2 = BindToHTMLElement.bind(node2, component, { indexes:[], stack:[] });
  }).toThrow("not radio");
});

test("BindToHTMLElement input checkbox throw", () => {
  const node1 = document.createElement("input");
  node1.type = "radio";
  node1.value = "100";
  node1.dataset.bind = "checkbox:aaa";
  const node2 = document.createElement("input");
  node2.type = "radio";
  node2.value = "200";
  node2.dataset.bind = "checkbox:aaa";
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
  expect(() => {
    const binds1 = BindToHTMLElement.bind(node1, component, { indexes:[], stack:[] });
  }).toThrow("not checkbox");
  expect(() => {
    const binds2 = BindToHTMLElement.bind(node2, component, { indexes:[], stack:[] });
  }).toThrow("not checkbox");
});

