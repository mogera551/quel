import { BindToHTMLElement } from "../../src/binder/BindToHTMLElement.js";
import { Symbols } from "../../src/Symbols.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Binding } from "../../src/binding/Binding.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { ElementEvent } from "../../src/binding/nodeProperty/ElementEvent.js";
import { Radio } from "../../src/binding/nodeProperty/Radio.js";
import { Checkbox } from "../../src/binding/nodeProperty/Checkbox.js";
import { MultiValue } from "../../src/binding/nodeProperty/MultiValue.js";
import { ViewModelProperty } from "../../src/binding/viewModelProperty/ViewModelProperty.js";
import { Context } from "../../src/context/Context.js";

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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.name).toBe("value");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["value"]);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLSelectElement);
  expect(bindings[0].nodeProperty.name).toBe("value");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["value"]);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLTextAreaElement);
  expect(bindings[0].nodeProperty.name).toBe("value");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["value"]);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(2);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.name).toBe("value");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["value"]);
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
  expect(bindings[1].context.indexes).toEqual([]);
  expect(bindings[1].context.stack).toEqual([]);
  expect(bindings[1].contextParam).toBe(null);
  expect(bindings[1].nodeProperty.constructor).toBe(ElementEvent);
  expect(bindings[1].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[1].nodeProperty.name).toBe("oninput");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["oninput"]);
  expect(bindings[1].nodeProperty.applicable).toBe(false);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.eventType).toBe("input");
  expect(bindings[1].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.name).toBe("change");
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("change"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);

  calledChange = false;
  node.value = "200";
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe("100");
  expect(calledChange).toBe(true);
});

test("BindToHTMLElement input not defaultEvent", () => {
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(2);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.name).toBe("value");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["value"]);
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
  expect(bindings[1].context.indexes).toEqual([]);
  expect(bindings[1].context.stack).toEqual([]);
  expect(bindings[1].contextParam).toBe(null);
  expect(bindings[1].nodeProperty.constructor).toBe(ElementEvent);
  expect(bindings[1].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[1].nodeProperty.name).toBe("onclick");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["onclick"]);
  expect(bindings[1].nodeProperty.applicable).toBe(false);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.eventType).toBe("click");
  expect(bindings[1].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.name).toBe("change");
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("change"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);

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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.node.checked).toBe(true);
  expect(bindings[0].nodeProperty.name).toBe("checked");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["checked"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe(true);
  expect(bindings[0].nodeProperty.filteredValue).toBe(true);
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe(true);
  expect(bindings[0].viewModelProperty.filteredValue).toBe(true);

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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings = BindToHTMLElement.bind(bindManager, node);
  expect(bindings.length).toBe(1);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.node.checked).toBe(true);
  expect(bindings[0].nodeProperty.name).toBe("checked");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["checked"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe(true);
  expect(bindings[0].nodeProperty.filteredValue).toBe(true);
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe(true);
  expect(bindings[0].viewModelProperty.filteredValue).toBe(true);

  node.checked = false;
  const event = new Event('input');
  node.dispatchEvent(event);
  expect(viewModel["aaa"]).toBe(false);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings1 = BindToHTMLElement.bind(bindManager, node1);
  const bindings2 = BindToHTMLElement.bind(bindManager, node2);
  const bindings = [];
  bindings.push(...bindings1);
  bindings.push(...bindings2);
  expect(bindings.length).toBe(2);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(Radio);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.node.checked).toBe(true);
  expect(bindings[0].nodeProperty.node.value).toBe("100");
  expect(bindings[0].nodeProperty.name).toBe("radio");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["radio"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toEqual(new MultiValue("100", true));
  expect(bindings[0].nodeProperty.filteredValue).toEqual(new MultiValue("100", true));
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
  expect(bindings[1].context.indexes).toEqual([]);
  expect(bindings[1].context.stack).toEqual([]);
  expect(bindings[1].contextParam).toBe(null);
  expect(bindings[1].nodeProperty.constructor).toBe(Radio);
  expect(bindings[1].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[1].nodeProperty.node.checked).toBe(false);
  expect(bindings[1].nodeProperty.node.value).toBe("200");
  expect(bindings[1].nodeProperty.name).toBe("radio");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["radio"]);
  expect(bindings[1].nodeProperty.applicable).toBe(true);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.value).toEqual(new MultiValue("200", false));
  expect(bindings[1].nodeProperty.filteredValue).toEqual(new MultiValue("200", false));
  expect(bindings[1].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.name).toBe("aaa");
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[1].viewModelProperty.value).toBe("100");
  expect(bindings[1].viewModelProperty.filteredValue).toBe("100");

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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  const bindings1 = BindToHTMLElement.bind(bindManager, node1);
  const bindings2 = BindToHTMLElement.bind(bindManager, node2);
  const bindings = [];
  bindings.push(...bindings1);
  bindings.push(...bindings2);
  expect(bindings.length).toBe(2);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context.indexes).toEqual([]);
  expect(bindings[0].context.stack).toEqual([]);
  expect(bindings[0].contextParam).toBe(null);
  expect(bindings[0].nodeProperty.constructor).toBe(Checkbox);
  expect(bindings[0].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[0].nodeProperty.node.checked).toBe(true);
  expect(bindings[0].nodeProperty.node.value).toBe("100");
  expect(bindings[0].nodeProperty.name).toBe("checkbox");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["checkbox"]);
  expect(bindings[0].nodeProperty.applicable).toBe(true);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toEqual(new MultiValue("100", true));
  expect(bindings[0].nodeProperty.filteredValue).toEqual(new MultiValue("100", true));
  expect(bindings[0].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[0].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[0].viewModelProperty.applicable).toBe(true);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toEqual(["100"]);
  expect(bindings[0].viewModelProperty.filteredValue).toEqual(["100"]);

  expect(bindings[1].component).toBe(component);
  expect(bindings[1].context.indexes).toEqual([]);
  expect(bindings[1].context.stack).toEqual([]);
  expect(bindings[1].contextParam).toBe(null);
  expect(bindings[1].nodeProperty.constructor).toBe(Checkbox);
  expect(bindings[1].nodeProperty.node.constructor).toBe(HTMLInputElement);
  expect(bindings[1].nodeProperty.node.checked).toBe(false);
  expect(bindings[1].nodeProperty.node.value).toBe("200");
  expect(bindings[1].nodeProperty.name).toBe("checkbox");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["checkbox"]);
  expect(bindings[1].nodeProperty.applicable).toBe(true);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.value).toEqual(new MultiValue("200", false));
  expect(bindings[1].nodeProperty.filteredValue).toEqual(new MultiValue("200", false));
  expect(bindings[1].viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(bindings[1].viewModelProperty.viewModel).toBe(component.viewModel);
  expect(bindings[1].viewModelProperty.applicable).toBe(true);
  expect(bindings[1].viewModelProperty.name).toBe("aaa");
  expect(bindings[1].viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[1].viewModelProperty.value).toEqual(["100"]);
  expect(bindings[1].viewModelProperty.filteredValue).toEqual(["100"]);

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

test("BindToHTMLElement no htmlelement throw", () => {
  const node = document.createTextNode("text");
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  expect(() => {
    const bindings1 = BindToHTMLElement.bind(bindManager, node);
  }).toThrow("not HTMLElement");
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  expect(() => {
    const bindings1 = BindToHTMLElement.bind(bindManager, node1);
  }).toThrow("not radio");
  expect(() => {
    const bindings2 = BindToHTMLElement.bind(bindManager, node2);
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
       * @param {Binding} binding 
       */
      addNodeUpdate(binding) {
        binding.nodeProperty.assignFromViewModelValue();
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
  const bindManager = { component, context:Context.create() };
  expect(() => {
    const bindings1 = BindToHTMLElement.bind(bindManager, node1);
  }).toThrow("not checkbox");
  expect(() => {
    const bindings2 = BindToHTMLElement.bind(bindManager, node2);
  }).toThrow("not checkbox");
});

