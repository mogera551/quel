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
import { RepeatBinding } from "../../src/binding/RepeatBinding.js";

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
  const binds = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(binds.length).toBe(5);
  expect(binds[0].constructor).toBe(Binding);
  expect(binds[0].nodeProperty.node).toBe(nodes[0]);
  expect(binds[0].nodeProperty.element).toBe(nodes[0]);
  expect(binds[0].nodeProperty.name).toBe("textContent");
  expect(binds[0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[0].nodeProperty.filters).toEqual([]);
  expect(binds[0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[0].nodeProperty.value).toBe("100");
  expect(binds[0].nodeProperty.filteredValue).toBe("100");
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty.name).toBe("aaa");
  expect(binds[0].viewModelProperty.propertyName).toBe(PropertyName.create("aaa"));
  expect(binds[0].viewModelProperty.filters).toEqual([]);
  expect(binds[0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[0].viewModelProperty.context).toEqual({ indexes:[], stack:[] });
  expect(binds[0].viewModelProperty.value).toBe("100");
  expect(binds[0].viewModelProperty.filteredValue).toBe("100");

  expect(binds[1].constructor).toBe(Binding);
  expect(binds[1].nodeProperty.node).toBe(nodes[1]);
  expect(binds[1].nodeProperty.element).toBe(nodes[1]);
  expect(binds[1].nodeProperty.name).toBe("textContent");
  expect(binds[1].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[1].nodeProperty.filters).toEqual([]);
  expect(binds[1].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[1].nodeProperty.value).toBe("200");
  expect(binds[1].nodeProperty.filteredValue).toBe("200");
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty.name).toBe("bbb");
  expect(binds[1].viewModelProperty.propertyName).toBe(PropertyName.create("bbb"));
  expect(binds[1].viewModelProperty.filters).toEqual([]);
  expect(binds[1].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[1].viewModelProperty.context).toEqual({ indexes:[], stack:[] });
  expect(binds[1].viewModelProperty.value).toBe("200");
  expect(binds[1].viewModelProperty.filteredValue).toBe("200");

  expect(binds[2].constructor).toBe(Binding);
  expect(binds[2].nodeProperty.node).toBe(nodes[2]);
  expect(binds[2].nodeProperty.element).toBe(nodes[2]);
  expect(binds[2].nodeProperty.name).toBe("textContent");
  expect(binds[2].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[2].nodeProperty.filters).toEqual([]);
  expect(binds[2].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[2].nodeProperty.value).toBe("300");
  expect(binds[2].nodeProperty.filteredValue).toBe("300");
  expect(binds[2].component).toBe(component);
  expect(binds[2].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[2].viewModelProperty.name).toBe("ccc");
  expect(binds[2].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(binds[2].viewModelProperty.filters).toEqual([]);
  expect(binds[2].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[2].viewModelProperty.context).toEqual({ indexes:[], stack:[] });
  expect(binds[2].viewModelProperty.value).toBe("300");
  expect(binds[2].viewModelProperty.filteredValue).toBe("300");

  expect(binds[3].constructor).toBe(RepeatBinding);
  expect(binds[3].nodeProperty.node).toBe(nodes[3]);
  expect(binds[3].nodeProperty.name).toBe("loop");
  expect(binds[3].nodeProperty.nameElements).toEqual(["loop"]);
  expect(binds[3].nodeProperty.filters).toEqual([]);
  expect(binds[3].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[3].nodeProperty.value).toBe(undefined);
  expect(binds[3].nodeProperty.filteredValue).toBe(undefined);
  expect(binds[3].component).toBe(component);
  expect(binds[3].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[3].viewModelProperty.name).toBe("ddd");
  expect(binds[3].viewModelProperty.propertyName).toBe(PropertyName.create("ddd"));
  expect(binds[3].viewModelProperty.filters).toEqual([]);
  expect(binds[3].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[3].viewModelProperty.context).toEqual({ indexes:[], stack:[] });
  expect(binds[3].viewModelProperty.value).toEqual(["1", "2", "3"]);
  expect(binds[3].viewModelProperty.filteredValue).toEqual(["1", "2", "3"]);
  expect(binds[3].children.length).toBe(3);
  expect(binds[3].children[0].length).toBe(1);
  expect(binds[3].children[0][0].constructor).toBe(Binding);
  expect(binds[3].children[0][0].nodeProperty.node.constructor).toBe(Text);
  expect(binds[3].children[0][0].nodeProperty.name).toBe("textContent");
  expect(binds[3].children[0][0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[3].children[0][0].nodeProperty.filters).toEqual([]);
  expect(binds[3].children[0][0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[3].children[0][0].nodeProperty.value).toBe(undefined);
  expect(binds[3].children[0][0].nodeProperty.filteredValue).toBe(undefined);
  expect(binds[3].children[0][0].component).toBe(component);
  expect(binds[3].children[0][0].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[3].children[0][0].viewModelProperty.name).toBe("ddd.*");
  expect(binds[3].children[0][0].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(binds[3].children[0][0].viewModelProperty.filters).toEqual([]);
  expect(binds[3].children[0][0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[3].children[0][0].viewModelProperty.context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });
  expect(binds[3].children[0][0].viewModelProperty.value).toBe("1");
  expect(binds[3].children[0][0].viewModelProperty.filteredValue).toBe("1");
  expect(binds[3].children[1].length).toBe(1);
  expect(binds[3].children[1][0].constructor).toBe(Binding);
  expect(binds[3].children[1][0].nodeProperty.node.constructor).toBe(Text);
  expect(binds[3].children[1][0].nodeProperty.name).toBe("textContent");
  expect(binds[3].children[1][0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[3].children[1][0].nodeProperty.filters).toEqual([]);
  expect(binds[3].children[1][0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[3].children[1][0].nodeProperty.value).toBe(undefined);
  expect(binds[3].children[1][0].nodeProperty.filteredValue).toBe(undefined);
  expect(binds[3].children[1][0].component).toBe(component);
  expect(binds[3].children[1][0].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[3].children[1][0].viewModelProperty.name).toBe("ddd.*");
  expect(binds[3].children[1][0].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(binds[3].children[1][0].viewModelProperty.filters).toEqual([]);
  expect(binds[3].children[1][0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[3].children[1][0].viewModelProperty.context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });
  expect(binds[3].children[1][0].viewModelProperty.value).toBe("2");
  expect(binds[3].children[1][0].viewModelProperty.filteredValue).toBe("2");
  expect(binds[3].children[2].length).toBe(1);
  expect(binds[3].children[2][0].constructor).toBe(Binding);
  expect(binds[3].children[2][0].nodeProperty.node.constructor).toBe(Text);
  expect(binds[3].children[2][0].nodeProperty.name).toBe("textContent");
  expect(binds[3].children[2][0].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[3].children[2][0].nodeProperty.filters).toEqual([]);
  expect(binds[3].children[2][0].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[3].children[2][0].nodeProperty.value).toBe(undefined);
  expect(binds[3].children[2][0].nodeProperty.filteredValue).toBe(undefined);
  expect(binds[3].children[2][0].component).toBe(component);
  expect(binds[3].children[2][0].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[3].children[2][0].viewModelProperty.name).toBe("ddd.*");
  expect(binds[3].children[2][0].viewModelProperty.propertyName).toBe(PropertyName.create("ccc"));
  expect(binds[3].children[2][0].viewModelProperty.filters).toEqual([]);
  expect(binds[3].children[2][0].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[3].children[2][0].viewModelProperty.context).toEqual({ indexes:[2], stack:[{indexes:[2], pos:0, propName:PropertyName.create("ddd")}] });
  expect(binds[3].children[2][0].viewModelProperty.value).toBe("3");
  expect(binds[3].children[2][0].viewModelProperty.filteredValue).toBe("3");

  expect(binds[4].constructor).toBe(Binding);
  expect(binds[4].nodeProperty.node).toBe(nodes[2]);
  expect(binds[4].nodeProperty.element).toBe(nodes[2]);
  expect(binds[4].nodeProperty.name).toBe("textContent");
  expect(binds[4].nodeProperty.nameElements).toEqual(["textContent"]);
  expect(binds[4].nodeProperty.filters).toEqual([]);
  expect(binds[4].nodeProperty.filterFuncs).toEqual(inputFilters);
  expect(binds[4].nodeProperty.value).toBe("400");
  expect(binds[4].nodeProperty.filteredValue).toBe("400");
  expect(binds[4].component).toBe(component);
  expect(binds[4].viewModelProperty.viewModel).toBe(viewModel);
  expect(binds[4].viewModelProperty.name).toBe("eee");
  expect(binds[4].viewModelProperty.propertyName).toBe(PropertyName.create("eee"));
  expect(binds[4].viewModelProperty.filters).toEqual([]);
  expect(binds[4].viewModelProperty.filterFuncs).toEqual(outputFilters);
  expect(binds[4].viewModelProperty.context).toEqual({ indexes:[], stack:[] });
  expect(binds[4].viewModelProperty.value).toBe("400");
  expect(binds[4].viewModelProperty.filteredValue).toBe("400");

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
  const binds = Binder.bind(nodes, component, { 
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[0].node).toBe(nodes[0]);
  expect(binds[0].element).toBe(nodes[0]);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("aaa");
  expect(binds[0].viewModelPropertyName).toEqual(PropertyName.create("aaa"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("aaa\t");
  expect(binds[0].contextIndexes).toEqual([1]);
  expect(binds[0].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[1] instanceof PropertyBind).toBe(true);
  expect(binds[1].node).toBe(nodes[1]);
  expect(binds[1].element).toBe(nodes[1]);
  expect(binds[1].nodeProperty).toBe("textContent");
  expect(binds[1].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[1].component).toBe(component);
  expect(binds[1].viewModel).toBe(viewModel);
  expect(binds[1].viewModelProperty).toBe("bbb");
  expect(binds[1].viewModelPropertyName).toEqual(PropertyName.create("bbb"));
  expect(binds[1].contextIndex).toBe(undefined);
  expect(binds[1].isContextIndex).toBe(false);
  expect(binds[1].filters).toEqual([]);
  expect(binds[1].contextParam).toBe(undefined);
  expect(binds[1].indexes).toEqual([]);
  expect(binds[1].indexesString).toBe("");
  expect(binds[1].viewModelPropertyKey).toBe("bbb\t");
  expect(binds[1].contextIndexes).toEqual([1]);
  expect(binds[1].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[2] instanceof PropertyBind).toBe(true);
  expect(binds[2].node).toBe(nodes[2]);
  expect(binds[2].element).toBe(nodes[2]);
  expect(binds[2].nodeProperty).toBe("textContent");
  expect(binds[2].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[2].component).toBe(component);
  expect(binds[2].viewModel).toBe(viewModel);
  expect(binds[2].viewModelProperty).toBe("ccc");
  expect(binds[2].viewModelPropertyName).toEqual(PropertyName.create("ccc"));
  expect(binds[2].contextIndex).toBe(undefined);
  expect(binds[2].isContextIndex).toBe(false);
  expect(binds[2].filters).toEqual([]);
  expect(binds[2].contextParam).toBe(undefined);
  expect(binds[2].indexes).toEqual([]);
  expect(binds[2].indexesString).toBe("");
  expect(binds[2].viewModelPropertyKey).toBe("ccc\t");
  expect(binds[2].contextIndexes).toEqual([1]);
  expect(binds[2].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[3] instanceof LoopBind).toBe(true);
  expect(binds[3].node instanceof Comment).toBe(true);
  expect(() => binds[3].element).toThrow();
  expect(binds[3].nodeProperty).toBe("loop");
  expect(binds[3].nodePropertyElements).toEqual(["loop"]);
  expect(binds[3].component).toBe(component);
  expect(binds[3].viewModel).toBe(viewModel);
  expect(binds[3].viewModelProperty).toBe("ddd");
  expect(binds[3].viewModelPropertyName).toEqual(PropertyName.create("ddd"));
  expect(binds[3].contextIndex).toBe(undefined);
  expect(binds[3].isContextIndex).toBe(false);
  expect(binds[3].filters).toEqual([]);
  expect(binds[3].contextParam).toBe(undefined);
  expect(binds[3].indexes).toEqual([]);
  expect(binds[3].indexesString).toBe("");
  expect(binds[3].viewModelPropertyKey).toBe("ddd\t");
  expect(binds[3].contextIndexes).toEqual([1]);
  expect(binds[3].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(binds[3].templateChildren.length).toBe(3);

  expect(binds[3].templateChildren[0].context).toEqual({
    indexes:[1, 0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(binds[3].templateChildren[0].binds.length).toBe(1);
  expect(binds[3].templateChildren[0].binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[0].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[0].binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[3].templateChildren[0].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[0].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[0].binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(binds[3].templateChildren[0].binds[0].contextIndex).toBe(undefined);
  expect(binds[3].templateChildren[0].binds[0].isContextIndex).toBe(false);
  expect(binds[3].templateChildren[0].binds[0].filters).toEqual([]);
  expect(binds[3].templateChildren[0].binds[0].contextParam).toEqual({indexes:[0], pos:1, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].indexesString).toBe("0");
  expect(binds[3].templateChildren[0].binds[0].viewModelPropertyKey).toBe("ddd.*\t0");
  expect(binds[3].templateChildren[0].binds[0].contextIndexes).toEqual([1, 0]);
  expect(binds[3].templateChildren[0].binds[0].context).toEqual({
    indexes:[1,0],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[0], pos:1, propName:PropertyName.create("ddd") }
    ]
  });


  expect(binds[3].templateChildren[1].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(binds[3].templateChildren[1].binds.length).toBe(1);
  expect(binds[3].templateChildren[1].binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[1].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[1].binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[3].templateChildren[1].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[1].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[1].binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(binds[3].templateChildren[1].binds[0].contextIndex).toBe(undefined);
  expect(binds[3].templateChildren[1].binds[0].isContextIndex).toBe(false);
  expect(binds[3].templateChildren[1].binds[0].filters).toEqual([]);
  expect(binds[3].templateChildren[1].binds[0].contextParam).toEqual({indexes:[1], pos:1, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].indexesString).toBe("1");
  expect(binds[3].templateChildren[1].binds[0].viewModelPropertyKey).toBe("ddd.*\t1");
  expect(binds[3].templateChildren[1].binds[0].contextIndexes).toEqual([1, 1]);
  expect(binds[3].templateChildren[1].binds[0].context).toEqual({
    indexes:[1, 1],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[1], pos:1, propName:PropertyName.create("ddd") }
    ]
  });


  expect(binds[3].templateChildren[2].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });
  expect(binds[3].templateChildren[2].binds.length).toBe(1);
  expect(binds[3].templateChildren[2].binds[0] instanceof PropertyBind).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].node instanceof HTMLDivElement).toBe(true);
  expect(binds[3].templateChildren[2].binds[0].nodeProperty).toBe("textContent");
  expect(binds[3].templateChildren[2].binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[3].templateChildren[2].binds[0].component).toBe(component);
  expect(binds[3].templateChildren[2].binds[0].viewModel).toBe(viewModel);
  expect(binds[3].templateChildren[2].binds[0].viewModelProperty).toBe("ddd.*");
  expect(binds[3].templateChildren[2].binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*"));
  expect(binds[3].templateChildren[2].binds[0].contextIndex).toBe(undefined);
  expect(binds[3].templateChildren[2].binds[0].isContextIndex).toBe(false);
  expect(binds[3].templateChildren[2].binds[0].filters).toEqual([]);
  expect(binds[3].templateChildren[2].binds[0].contextParam).toEqual({indexes:[2], pos:1, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[2].binds[0].indexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].indexesString).toBe("2");
  expect(binds[3].templateChildren[2].binds[0].viewModelPropertyKey).toBe("ddd.*\t2");
  expect(binds[3].templateChildren[2].binds[0].contextIndexes).toEqual([1, 2]);
  expect(binds[3].templateChildren[2].binds[0].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });

  expect(binds[4] instanceof TextBind).toBe(true);
  expect(binds[4].node instanceof Text).toBe(true);
  expect(() => binds[4].element).toThrow();
  expect(binds[4].nodeProperty).toBe("textContent");
  expect(binds[4].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[4].component).toBe(component);
  expect(binds[4].viewModel).toBe(viewModel);
  expect(binds[4].viewModelProperty).toBe("eee");
  expect(binds[4].viewModelPropertyName).toEqual(PropertyName.create("eee"));
  expect(binds[4].contextIndex).toBe(undefined);
  expect(binds[4].isContextIndex).toBe(false);
  expect(binds[4].filters).toEqual([]);
  expect(binds[4].contextParam).toBe(undefined);
  expect(binds[4].indexes).toEqual([]);
  expect(binds[4].indexesString).toBe("");
  expect(binds[4].viewModelPropertyKey).toBe("eee\t");
  expect(binds[4].contextIndexes).toEqual([1]);
  expect(binds[4].context).toEqual({
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
    const binds = Binder.bind(nodes, component, context);
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
  const binds = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(binds[0] instanceof LoopBind).toBe(true);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(() => binds[0].element).toThrow();
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
  expect(binds[0].component).toBe(component);
  expect(binds[0].viewModel).toBe(viewModel);
  expect(binds[0].viewModelProperty).toBe("ddd");
  expect(binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd"));
  expect(binds[0].contextIndex).toBe(undefined);
  expect(binds[0].isContextIndex).toBe(false);
  expect(binds[0].filters).toEqual([]);
  expect(binds[0].contextParam).toBe(undefined);
  expect(binds[0].indexes).toEqual([]);
  expect(binds[0].indexesString).toBe("");
  expect(binds[0].viewModelPropertyKey).toBe("ddd\t");
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[0].templateChildren.length).toBe(2);
  expect(binds[0].templateChildren[0].context).toEqual({
    indexes:[0],
    stack:[
      {
        indexes:[0], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(binds[0].templateChildren[0].binds.length).toBe(2);
  expect(binds[0].templateChildren[0].binds[0] instanceof AttributeBind).toBe(true);
  expect(binds[0].templateChildren[0].binds[0].node instanceof SVGElement).toBe(true); // ToDo:should be SVGTextElement
  expect(binds[0].templateChildren[0].binds[0].nodeProperty).toBe("attr.x");
  expect(binds[0].templateChildren[0].binds[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(binds[0].templateChildren[0].binds[0].component).toBe(component);
  expect(binds[0].templateChildren[0].binds[0].viewModel).toBe(viewModel);
  expect(binds[0].templateChildren[0].binds[0].viewModelProperty).toBe("ddd.*.x");
  expect(binds[0].templateChildren[0].binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.x"));
  expect(binds[0].templateChildren[0].binds[0].contextIndex).toBe(undefined);
  expect(binds[0].templateChildren[0].binds[0].isContextIndex).toBe(false);
  expect(binds[0].templateChildren[0].binds[0].filters).toEqual([]);
  expect(binds[0].templateChildren[0].binds[0].contextParam).toEqual({indexes:[0], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[0].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[0].indexesString).toBe("0");
  expect(binds[0].templateChildren[0].binds[0].viewModelPropertyKey).toBe("ddd.*.x\t0");
  expect(binds[0].templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[0].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[0].templateChildren[0].binds[1] instanceof TextBind).toBe(true);
  expect(binds[0].templateChildren[0].binds[1].node instanceof Node).toBe(true);
  expect(binds[0].templateChildren[0].binds[1].nodeProperty).toBe("textContent");
  expect(binds[0].templateChildren[0].binds[1].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].templateChildren[0].binds[1].component).toBe(component);
  expect(binds[0].templateChildren[0].binds[1].viewModel).toBe(viewModel);
  expect(binds[0].templateChildren[0].binds[1].viewModelProperty).toBe("ddd.*.name");
  expect(binds[0].templateChildren[0].binds[1].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.name"));
  expect(binds[0].templateChildren[0].binds[1].contextIndex).toBe(undefined);
  expect(binds[0].templateChildren[0].binds[1].isContextIndex).toBe(false);
  expect(binds[0].templateChildren[0].binds[1].filters).toEqual([]);
  expect(binds[0].templateChildren[0].binds[1].contextParam).toEqual({indexes:[0], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[0].templateChildren[0].binds[1].indexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[1].indexesString).toBe("0");
  expect(binds[0].templateChildren[0].binds[1].viewModelPropertyKey).toBe("ddd.*.name\t0");
  expect(binds[0].templateChildren[0].binds[1].contextIndexes).toEqual([0]);
  expect(binds[0].templateChildren[0].binds[1].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[0].templateChildren[1].context).toEqual({
    indexes:[1],
    stack:[
      {
        indexes:[1], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(binds[0].templateChildren[1].binds.length).toBe(2);
  expect(binds[0].templateChildren[1].binds[0] instanceof AttributeBind).toBe(true);
  expect(binds[0].templateChildren[1].binds[0].node instanceof SVGElement).toBe(true); // ToDo:should be SVGTextElement
  expect(binds[0].templateChildren[1].binds[0].nodeProperty).toBe("attr.x");
  expect(binds[0].templateChildren[1].binds[0].nodePropertyElements).toEqual(["attr", "x"]);
  expect(binds[0].templateChildren[1].binds[0].component).toBe(component);
  expect(binds[0].templateChildren[1].binds[0].viewModel).toBe(viewModel);
  expect(binds[0].templateChildren[1].binds[0].viewModelProperty).toBe("ddd.*.x");
  expect(binds[0].templateChildren[1].binds[0].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.x"));
  expect(binds[0].templateChildren[1].binds[0].contextIndex).toBe(undefined);
  expect(binds[0].templateChildren[1].binds[0].isContextIndex).toBe(false);
  expect(binds[0].templateChildren[1].binds[0].filters).toEqual([]);
  expect(binds[0].templateChildren[1].binds[0].contextParam).toEqual({indexes:[1], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[0].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[0].indexesString).toBe("1");
  expect(binds[0].templateChildren[1].binds[0].viewModelPropertyKey).toBe("ddd.*.x\t1");
  expect(binds[0].templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[0].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[0].templateChildren[1].binds[1] instanceof TextBind).toBe(true);
  expect(binds[0].templateChildren[1].binds[1].node instanceof Node).toBe(true);
  expect(binds[0].templateChildren[1].binds[1].nodeProperty).toBe("textContent");
  expect(binds[0].templateChildren[1].binds[1].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].templateChildren[1].binds[1].component).toBe(component);
  expect(binds[0].templateChildren[1].binds[1].viewModel).toBe(viewModel);
  expect(binds[0].templateChildren[1].binds[1].viewModelProperty).toBe("ddd.*.name");
  expect(binds[0].templateChildren[1].binds[1].viewModelPropertyName).toEqual(PropertyName.create("ddd.*.name"));
  expect(binds[0].templateChildren[1].binds[1].contextIndex).toBe(undefined);
  expect(binds[0].templateChildren[1].binds[1].isContextIndex).toBe(false);
  expect(binds[0].templateChildren[1].binds[1].filters).toEqual([]);
  expect(binds[0].templateChildren[1].binds[1].contextParam).toEqual({indexes:[1], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[0].templateChildren[1].binds[1].indexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[1].indexesString).toBe("1");
  expect(binds[0].templateChildren[1].binds[1].viewModelPropertyKey).toBe("ddd.*.name\t1");
  expect(binds[0].templateChildren[1].binds[1].contextIndexes).toEqual([1]);
  expect(binds[0].templateChildren[1].binds[1].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });
});
