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
  const bindings = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(bindings.length).toBe(1);
  expect(bindings[0] instanceof AttributeBind).toBe(true);
  expect(bindings[0].node).toBe(node);
  expect(bindings[0].node instanceof SVGElement).toBe(true);
  expect(bindings[0].node.getAttribute("x")).toBe("100");
  expect(bindings[0].element).toBe(node);
  expect(() => bindings[0].htmlElement).toThrow();
  expect(bindings[0].svgElement).toBe(node);
  expect(bindings[0].nodeProperty).toBe("attr.x");
  expect(bindings[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty).toBe("aaa");
  expect(bindings[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].filters).toEqual([]);
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].indexesString).toBe("");
  expect(bindings[0].viewModelPropertyKey).toBe("aaa\t");
  expect(bindings[0].contextIndexes).toEqual([]);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });

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
  const bindings = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(bindings.length).toBe(1);
  expect(bindings[0] instanceof PropertyBind).toBe(true);
  expect(bindings[0].node).toBe(node);
  expect(bindings[0].node instanceof SVGElement).toBe(true);
  expect(bindings[0].node.textContent).toBe("100");
  expect(bindings[0].element).toBe(node);
  expect(() => bindings[0].htmlElement).toThrow();
  expect(bindings[0].svgElement).toBe(node);
  expect(bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[0].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty).toBe("aaa");
  expect(bindings[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].filters).toEqual([]);
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].indexesString).toBe("");
  expect(bindings[0].viewModelPropertyKey).toBe("aaa\t");
  expect(bindings[0].contextIndexes).toEqual([]);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });

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
    const bindings = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
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
  expect(() => {const bindings = BindToSVGElement.bind(node, component, null, [])}).toThrow();
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
  const bindings = BindToSVGElement.bind(node, component, { indexes:[], stack:[] });
  expect(bindings.length).toBe(2);
  expect(bindings[0] instanceof AttributeBind).toBe(true);
  expect(bindings[0].node).toBe(node);
  expect(bindings[0].node instanceof SVGElement).toBe(true);
  expect(bindings[0].node.getAttribute("x")).toBe("100");
  expect(bindings[0].element).toBe(node);
  expect(() => bindings[0].htmlElement).toThrow();
  expect(bindings[0].svgElement).toBe(node);
  expect(bindings[0].nodeProperty).toBe("attr.x");
  expect(bindings[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty).toBe("aaa");
  expect(bindings[0].viewModelPropertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].filters).toEqual([]);
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].indexesString).toBe("");
  expect(bindings[0].viewModelPropertyKey).toBe("aaa\t");
  expect(bindings[0].contextIndexes).toEqual([]);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });

  expect(bindings[1] instanceof EventBind).toBe(true);
  expect(bindings[1].node).toBe(node);
  expect(bindings[1].node instanceof SVGElement).toBe(true);
  expect(bindings[1].element).toBe(node);
  expect(() => bindings[1].htmlElement).toThrow();
  expect(bindings[1].svgElement).toBe(node);
  expect(bindings[1].nodeProperty).toBe("onclick");
  expect(bindings[1].nodePropertyElements).toEqual(["onclick"]);
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].viewModel).toBe(viewModel);
  expect(bindings[1].viewModelProperty).toBe("change");
  expect(bindings[1].viewModelPropertyName).toBe(PropertyName.create("change"));
  expect(bindings[1].contextIndex).toBe(undefined);
  expect(bindings[1].isContextIndex).toBe(false);
  expect(bindings[1].filters).toEqual([]);
  expect(bindings[1].contextParam).toBe(undefined);
  expect(bindings[1].indexes).toEqual([]);
  expect(bindings[1].indexesString).toBe("");
  expect(bindings[1].viewModelPropertyKey).toBe("change\t");
  expect(bindings[1].contextIndexes).toEqual([]);
  expect(bindings[1].context).toEqual({ indexes:[], stack:[] });
/*
  calledChange = false;
  node.setAttribute("x", "200");
  const event = new Event('click');
  node.dispatchEvent(event);
  expect(calledChange).toBe(true);
*/
});
