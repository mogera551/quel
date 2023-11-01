import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { BindToSVGElement } from "../../src/binder/BindToSVGElement.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { ElementAttribute } from "../../src/binding/nodeProperty/ElementAttribute.js";
import { ViewModelProperty } from "../../src/binding/viewModelProperty/ViewModelProperty.js";
import { ElementEvent } from "../../src/binding/nodeProperty/ElementEvent.js";


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
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({indexes:[], stack:[]});
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementAttribute);
  expect(bindings[0].nodeProperty.node.constructor).toBe(SVGElement);
  expect(bindings[0].nodeProperty.name).toBe("attr.x");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["attr", "x"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");
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
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({indexes:[], stack:[]});
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(SVGElement);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");
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
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({indexes:[], stack:[]});
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementAttribute);
  expect(bindings[0].nodeProperty.node.constructor).toBe(SVGElement);
  expect(bindings[0].nodeProperty.name).toBe("attr.x");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["attr", "x"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");

  expect(bindings[1].component).toBe(component);
  expect(bindings[1].context).toEqual({indexes:[], stack:[]});
  expect(bindings[1].contextParam).toBe(undefined);
  expect(bindings[1].nodeProperty.constructor).toBe(ElementEvent);
  expect(bindings[1].nodeProperty.node.constructor).toBe(SVGElement);
  expect(bindings[1].nodeProperty.name).toBe("onclick");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["onclick"]);
  expect(bindings[1].nodeProperty.applicable).toBe(false);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.name).toBe("change");
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("change"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
/*
  calledChange = false;
  node.setAttribute("x", "200");
  const event = new Event('click');
  node.dispatchEvent(event);
  expect(calledChange).toBe(true);
*/
});
