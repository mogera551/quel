import { Binder } from "../../src/binder/Binder.js";
import { Symbols } from "../../src/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { LoopBind } from "../../src/bindInfo/template/Loop.js";
import { BindInfo } from "../../src/bindInfo/BindInfo.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Module } from "../../src/component/Module.js";
import { PropertyBind } from "../../src/bindInfo/Property.js";
import { TextBind } from "../../src/bindInfo/Text.js";
import { AttributeBind } from "../../src/bindInfo/Attribute.js";
import { inputFilters, outputFilters } from "../../src/filter/Builtin.js";
import { Binding, ChildBinding } from "../../src/binding/Binding.js";
import { Repeat } from "../../src/binding/nodeProperty/Repeat.js";
import { Branch } from "../../src/binding/nodeProperty/Branch.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { utils } from "../../src/utils.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

test("Binder", () => {
  const html = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
{{ loop:ddd }}
  <div data-bind="ddd.*"></div>
{{ end: }}
{{ eee }}
  `;
  const root = Module.htmlToTemplate(html);

  const elements = Array.from(root.content.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(root.content, comments);

  const nodes = elements.concat(comments);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    [Symbols.directlyGet](viewModelProperty, indexes) {
      if (viewModelProperty === "ddd.*") {
        return this["ddd"][indexes[0]];
      }
      return this[viewModelProperty];
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      if (viewModelProperty === "ddd.*") {
        this["ddd"][indexes[0]] = value;
      } else {
        this[viewModelProperty] = value;
      }
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
  const bindings = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(bindings.length).toBe(5);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[0].nodeProperty.node).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.element).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");

  expect(bindings[1].constructor).toBe(Binding);
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[1].nodeProperty.node).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.element).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.name).toBe("textContent");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[1].nodeProperty.filters).toEqual([]);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.value).toBe("200");
  expect(bindings[1].nodeProperty.filteredValue).toBe("200");
  expect(bindings[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[1].viewModelProperty.name).toBe("bbb");
  expect(bindings[1].viewModelProperty.propertyName).toBe(PropertyName.create("bbb"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[1].viewModelProperty.value).toBe("200");
  expect(bindings[1].viewModelProperty.filteredValue).toBe("200");

  expect(bindings[2].constructor).toBe(Binding);
  expect(bindings[2].component).toBe(component);
  expect(bindings[2].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[2].nodeProperty.node).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.element).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.name).toBe("textContent");
  expect(bindings[2].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[2].nodeProperty.filters).toEqual([]);
  expect(bindings[2].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[2].nodeProperty.value).toBe("300");
  expect(bindings[2].nodeProperty.filteredValue).toBe("300");
  expect(bindings[2].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[2].viewModelProperty.name).toBe("ccc");
  expect(bindings[2].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(bindings[2].viewModelProperty.filters).toEqual([]);
  expect(bindings[2].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[2].viewModelProperty.value).toBe("300");
  expect(bindings[2].viewModelProperty.filteredValue).toBe("300");

  expect(bindings[3].constructor).toBe(Binding);
  expect(bindings[3].component).toBe(component);
  expect(bindings[3].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[3].nodeProperty.node).toBe(nodes[3]);
  expect(bindings[3].nodeProperty.name).toBe("loop");
  expect(bindings[3].nodeProperty.nameElements).toEqual(["loop"]);
  expect(bindings[3].nodeProperty.filters).toEqual([]);
  expect(bindings[3].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].nodeProperty.value).toBe(3);
  expect(bindings[3].nodeProperty.filteredValue).toBe(3);
  expect(bindings[3].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].viewModelProperty.name).toBe("ddd");
  expect(bindings[3].viewModelProperty.propertyName).toBe(PropertyName.create("ddd"));
  expect(bindings[3].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].viewModelProperty.value).toEqual(["1", "2", "3"]);
  expect(bindings[3].viewModelProperty.filteredValue).toEqual(["1", "2", "3"]);
  expect(bindings[3].children.length).toBe(3);
  expect(bindings[3].children[0].bindings.length).toBe(1);
  expect(bindings[3].children[0].bindings[0].constructor).toBe(Binding);
  expect(bindings[3].children[0].bindings[0].component).toBe(component);
  expect(bindings[3].children[0].bindings[0].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[0].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[0].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[0].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[0].bindings[0].nodeProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].nodeProperty.filteredValue).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filteredValue).toBe("1");
  expect(bindings[3].children[1].bindings.length).toBe(1);
  expect(bindings[3].children[1].bindings[0].constructor).toBe(Binding);
  expect(bindings[3].children[1].bindings[0].component).toBe(component);
  expect(bindings[3].children[1].bindings[0].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[1].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[1].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[1].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[1].bindings[0].nodeProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].nodeProperty.filteredValue).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filteredValue).toBe("2");
  expect(bindings[3].children[2].bindings.length).toBe(1);
  expect(bindings[3].children[2].bindings[0].constructor).toBe(Binding);
  expect(bindings[3].children[2].bindings[0].component).toBe(component);
  expect(bindings[3].children[2].bindings[0].context).toEqual({ indexes:[2], stack:[{indexes:[2], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[2].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[2].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[2].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[2].bindings[0].nodeProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].nodeProperty.filteredValue).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filteredValue).toBe("3");

  expect(bindings[4].constructor).toBe(Binding);
  expect(bindings[4].component).toBe(component);
  expect(bindings[4].context).toEqual({ indexes:[], stack:[] });
//  expect(bindings[4].nodeProperty.node).toBe(nodes[4]);
//  expect(bindings[4].nodeProperty.element).toBe(nodes[4]);
  expect(bindings[4].nodeProperty.name).toBe("textContent");
  expect(bindings[4].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[4].nodeProperty.filters).toEqual([]);
  expect(bindings[4].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[4].nodeProperty.value).toBe("400");
  expect(bindings[4].nodeProperty.filteredValue).toBe("400");
  expect(bindings[4].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[4].viewModelProperty.name).toBe("eee");
  expect(bindings[4].viewModelProperty.propertyName).toBe(PropertyName.create("eee"));
  expect(bindings[4].viewModelProperty.filters).toEqual([]);
  expect(bindings[4].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[4].viewModelProperty.value).toBe("400");
  expect(bindings[4].viewModelProperty.filteredValue).toBe("400");

});

test("Binder context", () => {
  const html = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
{{ loop:ddd }}
  <div data-bind="ddd.*"></div>
{{ end: }}
{{ eee }}
  `;
  const root = Module.htmlToTemplate(html);

  const elements = Array.from(root.content.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(root.content, comments);

  const nodes = elements.concat(comments);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    "fff": [100, 200],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        return get(viewModelProperty.split("."), indexes.slice());
      } else if (indexes.length === 0) {
        return this[viewModelProperty];
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        const remain = viewModelProperty.split(".");
        const cloneIndexes = indexes.slice();
        let i = remain.pop();
        i = (i === "*") ? cloneIndexes.pop() : i;
        get(remain, cloneIndexes)[i] = value;
      } else if (indexes.length === 0) {
        this[viewModelProperty] = value;
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
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
  const bindings = Binder.bind(nodes, component, { 
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings.length).toBe(5);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[0].nodeProperty.node).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.element).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");

  expect(bindings[1].constructor).toBe(Binding);
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[1].nodeProperty.node).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.element).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.name).toBe("textContent");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[1].nodeProperty.filters).toEqual([]);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.value).toBe("200");
  expect(bindings[1].nodeProperty.filteredValue).toBe("200");
  expect(bindings[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[1].viewModelProperty.name).toBe("bbb");
  expect(bindings[1].viewModelProperty.propertyName).toBe(PropertyName.create("bbb"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[1].viewModelProperty.value).toBe("200");
  expect(bindings[1].viewModelProperty.filteredValue).toBe("200");

  expect(bindings[2].constructor).toBe(Binding);
  expect(bindings[2].component).toBe(component);
  expect(bindings[2].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[2].nodeProperty.node).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.element).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.name).toBe("textContent");
  expect(bindings[2].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[2].nodeProperty.filters).toEqual([]);
  expect(bindings[2].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[2].nodeProperty.value).toBe("300");
  expect(bindings[2].nodeProperty.filteredValue).toBe("300");
  expect(bindings[2].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[2].viewModelProperty.name).toBe("ccc");
  expect(bindings[2].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(bindings[2].viewModelProperty.filters).toEqual([]);
  expect(bindings[2].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[2].viewModelProperty.value).toBe("300");
  expect(bindings[2].viewModelProperty.filteredValue).toBe("300");

  expect(bindings[3].constructor).toBe(Binding);
  expect(bindings[3].component).toBe(component);
  expect(bindings[3].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[3].nodeProperty.constructor).toBe(Repeat);
//  expect(bindings[3].nodeProperty.node).toBe(nodes[4]);
//  expect(bindings[3].nodeProperty.element).toBe(nodes[4]);
  expect(bindings[3].nodeProperty.name).toBe("loop");
  expect(bindings[3].nodeProperty.nameElements).toEqual(["loop"]);
  expect(bindings[3].nodeProperty.filters).toEqual([]);
  expect(bindings[3].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].nodeProperty.value).toBe(3);
  expect(bindings[3].nodeProperty.filteredValue).toBe(3);
  expect(bindings[3].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].viewModelProperty.name).toBe("ddd");
  expect(bindings[3].viewModelProperty.propertyName).toBe(PropertyName.create("ddd"));
  expect(bindings[3].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].viewModelProperty.value).toEqual(["1", "2", "3"]);
  expect(bindings[3].viewModelProperty.filteredValue).toEqual(["1", "2", "3"]);
  expect(bindings[3].children.length).toBe(3);

  expect(bindings[3].children[0].constructor).toBe(ChildBinding);
  expect(bindings[3].children[0].context).toEqual({
    indexes:[1, 0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[0].bindings.length).toBe(1);
  expect(bindings[3].children[0].bindings[0].component).toBe(component);
  expect(bindings[3].children[0].bindings[0].context).toEqual({
    indexes:[1, 0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[0].bindings[0].contextParam).toEqual({ indexes:[0], pos:1, propName:PropertyName.create("ddd") });
  expect(bindings[3].children[0].bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[3].children[0].bindings[0].nodeProperty.node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[0].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[0].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[0].bindings[0].nodeProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].nodeProperty.filteredValue).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filteredValue).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.indexes).toEqual([0]);

  expect(bindings[3].children[1].constructor).toBe(ChildBinding);
  expect(bindings[3].children[1].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[1].bindings.length).toBe(1);
  expect(bindings[3].children[1].bindings[0].component).toBe(component);
  expect(bindings[3].children[1].bindings[0].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[1].bindings[0].contextParam).toEqual({ indexes:[1], pos:1, propName:PropertyName.create("ddd") });
  expect(bindings[3].children[1].bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[3].children[1].bindings[0].nodeProperty.node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[1].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[1].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[1].bindings[0].nodeProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].nodeProperty.filteredValue).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filteredValue).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.indexes).toEqual([1]);

  expect(bindings[3].children[2].constructor).toBe(ChildBinding);
  expect(bindings[3].children[2].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[2].bindings.length).toBe(1);
  expect(bindings[3].children[2].bindings[0].component).toBe(component);
  expect(bindings[3].children[2].bindings[0].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[2].bindings[0].contextParam).toEqual({ indexes:[2], pos:1, propName:PropertyName.create("ddd") });
  expect(bindings[3].children[2].bindings[0].nodeProperty.constructor).toBe(ElementProperty);
  expect(bindings[3].children[2].bindings[0].nodeProperty.node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[2].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[2].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[2].bindings[0].nodeProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].nodeProperty.filteredValue).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.propertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filteredValue).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.indexes).toEqual([2]);

  expect(bindings[4].constructor).toBe(Binding);
  expect(bindings[4].component).toBe(component);
  expect(bindings[4].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
//  expect(bindings[4].nodeProperty.node).toBe(nodes[4]);
//  expect(bindings[4].nodeProperty.element).toBe(nodes[4]);
  expect(bindings[4].nodeProperty.name).toBe("textContent");
  expect(bindings[4].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[4].nodeProperty.filters).toEqual([]);
  expect(bindings[4].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[4].nodeProperty.value).toBe("400");
  expect(bindings[4].nodeProperty.filteredValue).toBe("400");
  expect(bindings[4].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[4].viewModelProperty.name).toBe("eee");
  expect(bindings[4].viewModelProperty.propertyName).toBe(PropertyName.create("eee"));
  expect(bindings[4].viewModelProperty.filters).toEqual([]);
  expect(bindings[4].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[4].viewModelProperty.value).toBe("400");
  expect(bindings[4].viewModelProperty.filteredValue).toBe("400");

});

test("Binder indexes fail", () => {
  const html = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
{{ loop:ddd }}
  <div data-bind="ddd.*"></div>
{{ end: }}
{{ eee }}
  `;
  const root = Module.htmlToTemplate(html);
  const elements = Array.from(root.content.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(root.content, comments);
  const failNode = document.createDocumentFragment();

  const nodes = elements.concat(comments).concat(failNode);
  const viewModel = {
    "aaa": "100",
    "bbb": "200",
    "ccc": "300",
    "ddd": ["1", "2", "3"],
    "eee": "400",
    "fff": [100,200],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        return get(viewModelProperty.split("."), indexes.slice());
      } else if (indexes.length === 0) {
        return this[viewModelProperty];
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        const remain = viewModelProperty.split(".");
        const cloneIndexes = indexes.slice();
        let i = remain.pop();
        i = (i === "*") ? cloneIndexes.pop() : i;
        get(remain, cloneIndexes)[i] = value;
      } else if (indexes.length === 0) {
        this[viewModelProperty] = value;
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
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
  const contextBind = new BindInfo();
  expect(() => {
    const context = {
      indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("fff") }]
    }
    const bindings = Binder.bind(nodes, component, context);
  }).toThrow("unknown node type");
});

test("Binder svg", () => {
  const html = `
<svg>
{{ loop:ddd }}
<text data-bind="attr.x:ddd.*.x">{{ ddd.*.name }}</text>
{{ end: }}
</svg>
  `;
  const root = Module.htmlToTemplate(html);

  const elements = Array.from(root.content.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(root.content, comments);

  const nodes = elements.concat(comments);
  const viewModel = {
    "ddd": [{ name:"aaa", x:"10" }, { name:"bbb", x:"20" }],
    [Symbols.directlyGet](viewModelProperty, indexes) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        return get(viewModelProperty.split("."), indexes.slice());
      } else if (indexes.length === 0) {
        return this[viewModelProperty];
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
    },
    [Symbols.directlySet](viewModelProperty, indexes, value) {
      if (indexes.length > 0) {
        const get = (remain, indexes) => {
          let i = remain.pop();
          i = (i === "*") ? indexes.pop() : i;
          if (remain.length === 0) return this[i];
          return get(remain, indexes)[i];
        }
        const remain = viewModelProperty.split(".");
        const cloneIndexes = indexes.slice();
        let i = remain.pop();
        i = (i === "*") ? cloneIndexes.pop() : i;
        get(remain, cloneIndexes)[i] = value;
      } else if (indexes.length === 0) {
        this[viewModelProperty] = value;
      } else {
        utils.raise(`unknown property ${viewModelProperty}`);
      }
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
  const bindings = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(bindings.length).toBe(1);
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });
//  expect(bindings[0].nodeProperty.node).toBe(nodes[0]);
//  expect(bindings[0].nodeProperty.element).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.name).toBe("loop");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["loop"]);
  expect(bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe(2);
  expect(bindings[0].nodeProperty.filteredValue).toBe(2);
  expect(bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("ddd");
  expect(bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toEqual([{ name:"aaa", x:"10" }, { name:"bbb", x:"20" }]);
  expect(bindings[0].viewModelProperty.filteredValue).toEqual([{ name:"aaa", x:"10" }, { name:"bbb", x:"20" }]);

  expect(bindings[0].children.length).toBe(2);
  expect(bindings[0].children[0].context).toEqual({
    indexes:[0],
    stack:[
      { indexes:[0], pos:0, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[0].children[0].bindings.length).toBe(2);
  expect(bindings[0].children[0].bindings[0].nodeProperty.name).toBe("attr.x");
  expect(bindings[0].children[0].bindings[0].nodeProperty.nameElements).toEqual(["attr", "x"]);
  expect(bindings[0].children[0].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].children[0].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
//  expect(bindings[0].children[0].bindings[0].nodeProperty.value).toBe("10");
//  expect(bindings[0].children[0].bindings[0].nodeProperty.filteredValue).toBe("10");
  expect(bindings[0].children[0].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].children[0].bindings[0].viewModelProperty.name).toBe("ddd.*.x");
  expect(bindings[0].children[0].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*.x"));
  expect(bindings[0].children[0].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].children[0].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].children[0].bindings[0].viewModelProperty.value).toEqual("10");
  expect(bindings[0].children[0].bindings[0].viewModelProperty.filteredValue).toEqual("10");
  expect(bindings[0].children[0].bindings[0].viewModelProperty.indexes).toEqual([0]);

  expect(bindings[0].children[0].bindings[1].nodeProperty.name).toBe("textContent");
  expect(bindings[0].children[0].bindings[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].children[0].bindings[1].nodeProperty.filters).toEqual([]);
  expect(bindings[0].children[0].bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].children[0].bindings[1].nodeProperty.value).toBe("aaa");
  expect(bindings[0].children[0].bindings[1].nodeProperty.filteredValue).toBe("aaa");
  expect(bindings[0].children[0].bindings[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].children[0].bindings[1].viewModelProperty.name).toBe("ddd.*.name");
  expect(bindings[0].children[0].bindings[1].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*.name"));
  expect(bindings[0].children[0].bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].children[0].bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].children[0].bindings[1].viewModelProperty.value).toEqual("aaa");
  expect(bindings[0].children[0].bindings[1].viewModelProperty.filteredValue).toEqual("aaa");
  expect(bindings[0].children[0].bindings[1].viewModelProperty.indexes).toEqual([0]);

  expect(bindings[0].children[1].bindings.length).toBe(2);
  expect(bindings[0].children[1].bindings[0].nodeProperty.name).toBe("attr.x");
  expect(bindings[0].children[1].bindings[0].nodeProperty.nameElements).toEqual(["attr", "x"]);
  expect(bindings[0].children[1].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].children[1].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].children[1].bindings[0].nodeProperty.value).toBe("20");
  expect(bindings[0].children[1].bindings[0].nodeProperty.filteredValue).toBe("20");
  expect(bindings[0].children[1].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].children[1].bindings[0].viewModelProperty.name).toBe("ddd.*.x");
  expect(bindings[0].children[1].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*.x"));
  expect(bindings[0].children[1].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].children[1].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].children[1].bindings[0].viewModelProperty.value).toEqual("20");
  expect(bindings[0].children[1].bindings[0].viewModelProperty.filteredValue).toEqual("20");
  expect(bindings[0].children[1].bindings[0].viewModelProperty.indexes).toEqual([1]);

  expect(bindings[0].children[1].bindings[1].nodeProperty.name).toBe("textContent");
  expect(bindings[0].children[1].bindings[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].children[1].bindings[1].nodeProperty.filters).toEqual([]);
  expect(bindings[0].children[1].bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].children[1].bindings[1].nodeProperty.value).toBe("bbb");
  expect(bindings[0].children[1].bindings[1].nodeProperty.filteredValue).toBe("bbb");
  expect(bindings[0].children[1].bindings[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].children[1].bindings[1].viewModelProperty.name).toBe("ddd.*.name");
  expect(bindings[0].children[1].bindings[1].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*.name"));
  expect(bindings[0].children[1].bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].children[1].bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].children[1].bindings[1].viewModelProperty.value).toEqual("bbb");
  expect(bindings[0].children[1].bindings[1].viewModelProperty.filteredValue).toEqual("bbb");
  expect(bindings[0].children[1].bindings[1].viewModelProperty.indexes).toEqual([1]);

});
