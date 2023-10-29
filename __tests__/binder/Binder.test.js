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
import { Binding } from "../../src/binding/Binding.js";
import { Repeat } from "../../src/binding/nodePoperty/Repeat.js";
import { Branch } from "../../src/binding/nodePoperty/Branch.js";

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
  expect(bindings[0].nodeProperty.node).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.element).toBe(nodes[0]);
  expect(bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[0].nodeProperty.value).toBe("100");
  expect(bindings[0].nodeProperty.filteredValue).toBe("100");
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty.name).toBe("aaa");
  expect(bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("aaa"));
  expect(bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[0].viewModelProperty.value).toBe("100");
  expect(bindings[0].viewModelProperty.filteredValue).toBe("100");

  expect(bindings[1].constructor).toBe(Binding);
  expect(bindings[1].nodeProperty.node).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.element).toBe(nodes[1]);
  expect(bindings[1].nodeProperty.name).toBe("textContent");
  expect(bindings[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[1].nodeProperty.filters).toEqual([]);
  expect(bindings[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[1].nodeProperty.value).toBe("200");
  expect(bindings[1].nodeProperty.filteredValue).toBe("200");
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[1].viewModelProperty.name).toBe("bbb");
  expect(bindings[1].viewModelProperty.propertyName).toBe(PropertyName.create("bbb"));
  expect(bindings[1].viewModelProperty.filters).toEqual([]);
  expect(bindings[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[1].viewModelProperty.value).toBe("200");
  expect(bindings[1].viewModelProperty.filteredValue).toBe("200");

  expect(bindings[2].constructor).toBe(Binding);
  expect(bindings[2].nodeProperty.node).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.element).toBe(nodes[2]);
  expect(bindings[2].nodeProperty.name).toBe("textContent");
  expect(bindings[2].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[2].nodeProperty.filters).toEqual([]);
  expect(bindings[2].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[2].nodeProperty.value).toBe("300");
  expect(bindings[2].nodeProperty.filteredValue).toBe("300");
  expect(bindings[2].component).toBe(component);
  expect(bindings[2].context).toEqual({ indexes:[], stack:[] });
  expect(bindings[2].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[2].viewModelProperty.name).toBe("ccc");
  expect(bindings[2].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(bindings[2].viewModelProperty.filters).toEqual([]);
  expect(bindings[2].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[2].viewModelProperty.value).toBe("300");
  expect(bindings[2].viewModelProperty.filteredValue).toBe("300");

  expect(bindings[3].constructor).toBe(Binding);
  expect(bindings[3].nodeProperty.node).toBe(nodes[3]);
  expect(bindings[3].nodeProperty.name).toBe("loop");
  expect(bindings[3].nodeProperty.nameElements).toEqual(["loop"]);
  expect(bindings[3].nodeProperty.filters).toEqual([]);
  expect(bindings[3].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].nodeProperty.value).toBe(3);
  expect(bindings[3].nodeProperty.filteredValue).toBe(3);
  expect(bindings[3].component).toBe(component);
  expect(bindings[3].context).toEqual({ indexes:[], stack:[] });
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
  expect(bindings[3].children[0].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[0].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[0].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[0].bindings[0].nodeProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].nodeProperty.filteredValue).toBe("1");
  expect(bindings[3].children[0].bindings[0].component).toBe(component);
  expect(bindings[3].children[0].bindings[0].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[0].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[0].bindings[0].viewModelProperty.value).toBe("1");
  expect(bindings[3].children[0].bindings[0].viewModelProperty.filteredValue).toBe("1");
  expect(bindings[3].children[1].bindings.length).toBe(1);
  expect(bindings[3].children[1].bindings[0].constructor).toBe(Binding);
  expect(bindings[3].children[1].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[1].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[1].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[1].bindings[0].nodeProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].nodeProperty.filteredValue).toBe("2");
  expect(bindings[3].children[1].bindings[0].component).toBe(component);
  expect(bindings[3].children[1].bindings[0].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[1].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(bindings[3].children[1].bindings[0].viewModelProperty.value).toBe("2");
  expect(bindings[3].children[1].bindings[0].viewModelProperty.filteredValue).toBe("2");
  expect(bindings[3].children[2].bindings.length).toBe(1);
  expect(bindings[3].children[2].bindings[0].constructor).toBe(Binding);
  expect(bindings[3].children[2].bindings[0].nodeProperty.node.constructor).toBe(HTMLDivElement);
  expect(bindings[3].children[2].bindings[0].nodeProperty.name).toBe("textContent");
  expect(bindings[3].children[2].bindings[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[3].children[2].bindings[0].nodeProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].nodeProperty.filteredValue).toBe("3");
  expect(bindings[3].children[2].bindings[0].component).toBe(component);
  expect(bindings[3].children[2].bindings[0].context).toEqual({ indexes:[2], stack:[{indexes:[2], pos:0, propName:PropertyName.create("ddd")}] });
  expect(bindings[3].children[2].bindings[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.name).toBe("ddd.*");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.propertyName).toBe(PropertyName.create("ddd.*"));
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].viewModelProperty.value).toBe("3");
  expect(bindings[3].children[2].bindings[0].viewModelProperty.filteredValue).toBe("3");

  expect(bindings[4].constructor).toBe(Binding);
//  expect(bindings[4].nodeProperty.node).toBe(nodes[4]);
//  expect(bindings[4].nodeProperty.element).toBe(nodes[4]);
  expect(bindings[4].nodeProperty.name).toBe("textContent");
  expect(bindings[4].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(bindings[4].nodeProperty.filters).toEqual([]);
  expect(bindings[4].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(bindings[4].nodeProperty.value).toBe("400");
  expect(bindings[4].nodeProperty.filteredValue).toBe("400");
  expect(bindings[4].component).toBe(component);
  expect(bindings[4].context).toEqual({ indexes:[], stack:[] });
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
  const contextBind = new BindInfo();
  const bindings = Binder.bind(nodes, component, { 
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[0].constructor).toBe(Binding);
  expect(bindings[0].node).toBe(nodes[0]);
  expect(bindings[0].element).toBe(nodes[0]);
  expect(bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[0].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty).toBe("aaa");
  expect(bindings[0].viewModelPropertyName).toEqual(PropertyName.create("aaa"));
  expect(bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].filters).toEqual([]);
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].indexesString).toBe("");
  expect(bindings[0].viewModelPropertyKey).toBe("aaa\t");
  expect(bindings[0].contextIndexes).toEqual([1]);
  expect(bindings[0].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(bindings[1] instanceof PropertyBind).toBe(true);
  expect(bindings[1].node).toBe(nodes[1]);
  expect(bindings[1].element).toBe(nodes[1]);
  expect(bindings[1].nodeProperty).toBe("textContent");
  expect(bindings[1].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[1].component).toBe(component);
  expect(bindings[1].viewModel).toBe(viewModel);
  expect(bindings[1].viewModelProperty).toBe("bbb");
  expect(bindings[1].viewModelPropertyName).toEqual(PropertyName.create("bbb"));
  expect(bindings[1].contextIndex).toBe(undefined);
  expect(bindings[1].isContextIndex).toBe(false);
  expect(bindings[1].filters).toEqual([]);
  expect(bindings[1].contextParam).toBe(undefined);
  expect(bindings[1].indexes).toEqual([]);
  expect(bindings[1].indexesString).toBe("");
  expect(bindings[1].viewModelPropertyKey).toBe("bbb\t");
  expect(bindings[1].contextIndexes).toEqual([1]);
  expect(bindings[1].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(bindings[2] instanceof PropertyBind).toBe(true);
  expect(bindings[2].node).toBe(nodes[2]);
  expect(bindings[2].element).toBe(nodes[2]);
  expect(bindings[2].nodeProperty).toBe("textContent");
  expect(bindings[2].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[2].component).toBe(component);
  expect(bindings[2].viewModel).toBe(viewModel);
  expect(bindings[2].viewModelProperty).toBe("ccc");
  expect(bindings[2].viewModelPropertyName).toEqual(PropertyName.create("ccc"));
  expect(bindings[2].contextIndex).toBe(undefined);
  expect(bindings[2].isContextIndex).toBe(false);
  expect(bindings[2].filters).toEqual([]);
  expect(bindings[2].contextParam).toBe(undefined);
  expect(bindings[2].indexes).toEqual([]);
  expect(bindings[2].indexesString).toBe("");
  expect(bindings[2].viewModelPropertyKey).toBe("ccc\t");
  expect(bindings[2].contextIndexes).toEqual([1]);
  expect(bindings[2].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(bindings[3] instanceof LoopBind).toBe(true);
  expect(bindings[3].node instanceof Comment).toBe(true);
  expect(() => bindings[3].element).toThrow();
  expect(bindings[3].nodeProperty).toBe("loop");
  expect(bindings[3].nodePropertyElements).toEqual(["loop"]);
  expect(bindings[3].component).toBe(component);
  expect(bindings[3].viewModel).toBe(viewModel);
  expect(bindings[3].viewModelProperty).toBe("ddd");
  expect(bindings[3].viewModelPropertyName).toEqual(PropertyName.create("ddd"));
  expect(bindings[3].contextIndex).toBe(undefined);
  expect(bindings[3].isContextIndex).toBe(false);
  expect(bindings[3].filters).toEqual([]);
  expect(bindings[3].contextParam).toBe(undefined);
  expect(bindings[3].indexes).toEqual([]);
  expect(bindings[3].indexesString).toBe("");
  expect(bindings[3].viewModelPropertyKey).toBe("ddd\t");
  expect(bindings[3].contextIndexes).toEqual([1]);
  expect(bindings[3].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(bindings[3].children.length).toBe(3);

  expect(bindings[3].children[0].context).toEqual({
    indexes:[1, 0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[0].bindings.length).toBe(1);
  expect(bindings[3].children[0].bindings[0] instanceof PropertyBind).toBe(true);
  expect(bindings[3].children[0].bindings[0].node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[0].bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[3].children[0].bindings[0].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[3].children[0].bindings[0].component).toBe(component);
  expect(bindings[3].children[0].bindings[0].viewModel).toBe(viewModel);
  expect(bindings[3].children[0].bindings[0].viewModelProperty).toBe("ddd.*");
  expect(bindings[3].children[0].bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[0].bindings[0].contextIndex).toBe(undefined);
  expect(bindings[3].children[0].bindings[0].isContextIndex).toBe(false);
  expect(bindings[3].children[0].bindings[0].filters).toEqual([]);
  expect(bindings[3].children[0].bindings[0].contextParam).toEqual({indexes:[0], pos:1, propName:PropertyName.create("ddd")});
  expect(bindings[3].children[0].bindings[0].indexes).toEqual([0]);
  expect(bindings[3].children[0].bindings[0].indexesString).toBe("0");
  expect(bindings[3].children[0].bindings[0].viewModelPropertyKey).toBe("ddd.*\t0");
  expect(bindings[3].children[0].bindings[0].contextIndexes).toEqual([1, 0]);
  expect(bindings[3].children[0].bindings[0].context).toEqual({
    indexes:[1,0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });


  expect(bindings[3].children[1].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[1].bindings.length).toBe(1);
  expect(bindings[3].children[1].bindings[0] instanceof PropertyBind).toBe(true);
  expect(bindings[3].children[1].bindings[0].node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[1].bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[3].children[1].bindings[0].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[3].children[1].bindings[0].component).toBe(component);
  expect(bindings[3].children[1].bindings[0].viewModel).toBe(viewModel);
  expect(bindings[3].children[1].bindings[0].viewModelProperty).toBe("ddd.*");
  expect(bindings[3].children[1].bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[1].bindings[0].contextIndex).toBe(undefined);
  expect(bindings[3].children[1].bindings[0].isContextIndex).toBe(false);
  expect(bindings[3].children[1].bindings[0].filters).toEqual([]);
  expect(bindings[3].children[1].bindings[0].contextParam).toEqual({indexes:[1], pos:1, propName:PropertyName.create("ddd")});
  expect(bindings[3].children[1].bindings[0].indexes).toEqual([1]);
  expect(bindings[3].children[1].bindings[0].indexesString).toBe("1");
  expect(bindings[3].children[1].bindings[0].viewModelPropertyKey).toBe("ddd.*\t1");
  expect(bindings[3].children[1].bindings[0].contextIndexes).toEqual([1, 1]);
  expect(bindings[3].children[1].bindings[0].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });


  expect(bindings[3].children[2].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(bindings[3].children[2].bindings.length).toBe(1);
  expect(bindings[3].children[2].bindings[0] instanceof PropertyBind).toBe(true);
  expect(bindings[3].children[2].bindings[0].node instanceof HTMLDivElement).toBe(true);
  expect(bindings[3].children[2].bindings[0].nodeProperty).toBe("textContent");
  expect(bindings[3].children[2].bindings[0].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[3].children[2].bindings[0].component).toBe(component);
  expect(bindings[3].children[2].bindings[0].viewModel).toBe(viewModel);
  expect(bindings[3].children[2].bindings[0].viewModelProperty).toBe("ddd.*");
  expect(bindings[3].children[2].bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(bindings[3].children[2].bindings[0].contextIndex).toBe(undefined);
  expect(bindings[3].children[2].bindings[0].isContextIndex).toBe(false);
  expect(bindings[3].children[2].bindings[0].filters).toEqual([]);
  expect(bindings[3].children[2].bindings[0].contextParam).toEqual({indexes:[2], pos:1, propName:PropertyName.create("ddd")});
  expect(bindings[3].children[2].bindings[0].indexes).toEqual([2]);
  expect(bindings[3].children[2].bindings[0].indexesString).toBe("2");
  expect(bindings[3].children[2].bindings[0].viewModelPropertyKey).toBe("ddd.*\t2");
  expect(bindings[3].children[2].bindings[0].contextIndexes).toEqual([1, 2]);
  expect(bindings[3].children[2].bindings[0].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });

  expect(bindings[4] instanceof TextBind).toBe(true);
  expect(bindings[4].node instanceof Text).toBe(true);
  expect(() => bindings[4].element).toThrow();
  expect(bindings[4].nodeProperty).toBe("textContent");
  expect(bindings[4].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[4].component).toBe(component);
  expect(bindings[4].viewModel).toBe(viewModel);
  expect(bindings[4].viewModelProperty).toBe("eee");
  expect(bindings[4].viewModelPropertyName).toEqual(PropertyName.create("eee"));
  expect(bindings[4].contextIndex).toBe(undefined);
  expect(bindings[4].isContextIndex).toBe(false);
  expect(bindings[4].filters).toEqual([]);
  expect(bindings[4].contextParam).toBe(undefined);
  expect(bindings[4].indexes).toEqual([]);
  expect(bindings[4].indexesString).toBe("");
  expect(bindings[4].viewModelPropertyKey).toBe("eee\t");
  expect(bindings[4].contextIndexes).toEqual([1]);
  expect(bindings[4].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

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
  const bindings = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(bindings[0] instanceof LoopBind).toBe(true);
  expect(bindings[0].node instanceof Comment).toBe(true);
  expect(() => bindings[0].element).toThrow();
  expect(bindings[0].nodeProperty).toBe("loop");
  expect(bindings[0].nodePropertyElements).toEqual(["loop"]);
  expect(bindings[0].component).toBe(component);
  expect(bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].viewModelProperty).toBe("ddd");
  expect(bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd"));
  expect(bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].filters).toEqual([]);
  expect(bindings[0].contextParam).toBe(undefined);
  expect(bindings[0].indexes).toEqual([]);
  expect(bindings[0].indexesString).toBe("");
  expect(bindings[0].viewModelPropertyKey).toBe("ddd\t");
  expect(bindings[0].contextIndexes).toEqual([]);
  expect(bindings[0].context).toEqual({ indexes:[], stack:[] });

  expect(bindings[0].children.length).toBe(2);
  expect(bindings[0].children[0].context).toEqual({
    indexes:[0],
    stack:[
      {
        indexes:[0], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(bindings[0].children[0].bindings.length).toBe(2);
  expect(bindings[0].children[0].bindings[0] instanceof AttributeBind).toBe(true);
  expect(bindings[0].children[0].bindings[0].node instanceof SVGElement).toBe(true); // ToDo:should be SVGTextElement
  expect(bindings[0].children[0].bindings[0].nodeProperty).toBe("attr.x");
  expect(bindings[0].children[0].bindings[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(bindings[0].children[0].bindings[0].component).toBe(component);
  expect(bindings[0].children[0].bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].children[0].bindings[0].viewModelProperty).toBe("ddd.*.x");
  expect(bindings[0].children[0].bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.x"));
  expect(bindings[0].children[0].bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].children[0].bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].children[0].bindings[0].filters).toEqual([]);
  expect(bindings[0].children[0].bindings[0].contextParam).toEqual({indexes:[0], pos:0, propName:PropertyName.create("ddd")});
  expect(bindings[0].children[0].bindings[0].indexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[0].indexesString).toBe("0");
  expect(bindings[0].children[0].bindings[0].viewModelPropertyKey).toBe("ddd.*.x\t0");
  expect(bindings[0].children[0].bindings[0].contextIndexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[0].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });

  expect(bindings[0].children[0].bindings[1] instanceof TextBind).toBe(true);
  expect(bindings[0].children[0].bindings[1].node instanceof Node).toBe(true);
  expect(bindings[0].children[0].bindings[1].nodeProperty).toBe("textContent");
  expect(bindings[0].children[0].bindings[1].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[0].children[0].bindings[1].component).toBe(component);
  expect(bindings[0].children[0].bindings[1].viewModel).toBe(viewModel);
  expect(bindings[0].children[0].bindings[1].viewModelProperty).toBe("ddd.*.name");
  expect(bindings[0].children[0].bindings[1].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.name"));
  expect(bindings[0].children[0].bindings[1].contextIndex).toBe(undefined);
  expect(bindings[0].children[0].bindings[1].isContextIndex).toBe(false);
  expect(bindings[0].children[0].bindings[1].filters).toEqual([]);
  expect(bindings[0].children[0].bindings[1].contextParam).toEqual({indexes:[0], pos:0, propName:PropertyName.create("ddd")});
  expect(bindings[0].children[0].bindings[1].indexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[1].indexesString).toBe("0");
  expect(bindings[0].children[0].bindings[1].viewModelPropertyKey).toBe("ddd.*.name\t0");
  expect(bindings[0].children[0].bindings[1].contextIndexes).toEqual([0]);
  expect(bindings[0].children[0].bindings[1].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });

  expect(bindings[0].children[1].context).toEqual({
    indexes:[1],
    stack:[
      {
        indexes:[1], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(bindings[0].children[1].bindings.length).toBe(2);
  expect(bindings[0].children[1].bindings[0] instanceof AttributeBind).toBe(true);
  expect(bindings[0].children[1].bindings[0].node instanceof SVGElement).toBe(true); // ToDo:should be SVGTextElement
  expect(bindings[0].children[1].bindings[0].nodeProperty).toBe("attr.x");
  expect(bindings[0].children[1].bindings[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(bindings[0].children[1].bindings[0].component).toBe(component);
  expect(bindings[0].children[1].bindings[0].viewModel).toBe(viewModel);
  expect(bindings[0].children[1].bindings[0].viewModelProperty).toBe("ddd.*.x");
  expect(bindings[0].children[1].bindings[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.x"));
  expect(bindings[0].children[1].bindings[0].contextIndex).toBe(undefined);
  expect(bindings[0].children[1].bindings[0].isContextIndex).toBe(false);
  expect(bindings[0].children[1].bindings[0].filters).toEqual([]);
  expect(bindings[0].children[1].bindings[0].contextParam).toEqual({indexes:[1], pos:0, propName:PropertyName.create("ddd")});
  expect(bindings[0].children[1].bindings[0].indexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[0].indexesString).toBe("1");
  expect(bindings[0].children[1].bindings[0].viewModelPropertyKey).toBe("ddd.*.x\t1");
  expect(bindings[0].children[1].bindings[0].contextIndexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[0].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });

  expect(bindings[0].children[1].bindings[1] instanceof TextBind).toBe(true);
  expect(bindings[0].children[1].bindings[1].node instanceof Node).toBe(true);
  expect(bindings[0].children[1].bindings[1].nodeProperty).toBe("textContent");
  expect(bindings[0].children[1].bindings[1].nodePropertyElements).toEqual(["textContent"]);
  expect(bindings[0].children[1].bindings[1].component).toBe(component);
  expect(bindings[0].children[1].bindings[1].viewModel).toBe(viewModel);
  expect(bindings[0].children[1].bindings[1].viewModelProperty).toBe("ddd.*.name");
  expect(bindings[0].children[1].bindings[1].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.name"));
  expect(bindings[0].children[1].bindings[1].contextIndex).toBe(undefined);
  expect(bindings[0].children[1].bindings[1].isContextIndex).toBe(false);
  expect(bindings[0].children[1].bindings[1].filters).toEqual([]);
  expect(bindings[0].children[1].bindings[1].contextParam).toEqual({indexes:[1], pos:0, propName:PropertyName.create("ddd")});
  expect(bindings[0].children[1].bindings[1].indexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[1].indexesString).toBe("1");
  expect(bindings[0].children[1].bindings[1].viewModelPropertyKey).toBe("ddd.*.name\t1");
  expect(bindings[0].children[1].bindings[1].contextIndexes).toEqual([1]);
  expect(bindings[0].children[1].bindings[1].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });
});
