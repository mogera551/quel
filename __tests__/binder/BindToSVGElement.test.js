//import { Component } from "../../src/component/Component.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { Event as EventBind } from "../../src/bindInfo/Event.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { BindToSVGElement } from "../../src/binder/BindToSVGElement.js";
import { AttributeBind } from "../../src/bindInfo/Attribute.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";


test("BindToSVGElement text attribute", () => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  node.dataset.bind = "attr.x:aaa";
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
  const binds = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof AttributeBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof SVGElement).toBe(true);
  expect(binds[0].node.getAttribute("x")).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(() => binds[0].htmlElement).toThrow();
  expect(binds[0].svgElement).toBe(node);
  expect(binds[0].nodeProperty).toBe("attr.x");
  expect(binds[0].nodePropertyElements).toEqual(["attr", "x"]);
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

});

test("BindToSVGElement text property ", () => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  node.dataset.bind = "textContent:aaa";
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
  const binds = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(1);
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof SVGElement).toBe(true);
  expect(binds[0].node.textContent).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(() => binds[0].htmlElement).toThrow();
  expect(binds[0].svgElement).toBe(node);
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

});

test("BindToHTMLElement text property default", () => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
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
  expect(() => {
    const binds = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  }).toThrow();
});

test("BindToSVGElement not element", () => {
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
  expect(() => {const binds = BindToSVGElement.bind(node, component, null, [])}).toThrow();
});

test("BindToSVGElement text property event", () => {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  node.dataset.bind = "attr.x:aaa; onclick:change;";
  let calledChange = undefined;
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
  const binds = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(binds.length).toBe(2);
  expect(binds[0] instanceof AttributeBind).toBe(true);
  expect(binds[0].node).toBe(node);
  expect(binds[0].node instanceof SVGElement).toBe(true);
  expect(binds[0].node.getAttribute("x")).toBe("100");
  expect(binds[0].element).toBe(node);
  expect(() => binds[0].htmlElement).toThrow();
  expect(binds[0].svgElement).toBe(node);
  expect(binds[0].nodeProperty).toBe("attr.x");
  expect(binds[0].nodePropertyElements).toEqual(["attr", "x"]);
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
  expect(binds[1].node instanceof SVGElement).toBe(true);
  expect(binds[1].element).toBe(node);
  expect(() => binds[1].htmlElement).toThrow();
  expect(binds[1].svgElement).toBe(node);
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
/*
  calledChange = false;
  node.setAttribute("x", "200");
  const event = new Event('click');
  node.dispatchEvent(event);
  expect(calledChange).toBe(true);
*/
});
