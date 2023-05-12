import { Binder } from "../../src/binder/Binder.js";
import { Symbols } from "../../src/viewModel/Symbols.js";
import { NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { Template as TemplateBind } from "../../src/bindInfo/Template.js";
import { BindInfo } from "../../src/bindInfo/BindInfo.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

test("Binder", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);

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
    }
  };
  const binds = Binder.bind(nodes, component, { 
    indexes:[], stack:[]
  });
  expect(binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[0].contextIndexes).toEqual([]);
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({ indexes:[], stack:[] });

  expect(binds[1] instanceof LevelTop).toBe(true);
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
  expect(binds[1].contextIndexes).toEqual([]);
  expect(binds[1].lastNodeValue).toBe(undefined);
  expect(binds[1].lastViewModelValue).toBe("200");
  expect(binds[1].context).toEqual({ indexes:[], stack:[] });

  expect(binds[2] instanceof LevelTop).toBe(true);
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
  expect(binds[2].contextIndexes).toEqual([]);
  expect(binds[2].lastNodeValue).toBe(undefined);
  expect(binds[2].lastViewModelValue).toBe("300");
  expect(binds[2].context).toEqual({ indexes:[], stack:[] });

  expect(binds[3] instanceof TemplateBind).toBe(true);
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
  expect(binds[3].contextIndexes).toEqual([]);
  expect(binds[3].lastNodeValue).toBe(undefined);
  expect(binds[3].lastViewModelValue).toEqual(["1", "2", "3"]);
  expect(binds[3].context).toEqual({ indexes:[], stack:[] });

  expect(binds[3].templateChildren.length).toBe(3);
  expect(binds[3].templateChildren[0].context).toEqual({
    indexes:[0],
    stack:[
      {
        indexes:[0], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(binds[3].templateChildren[0].binds.length).toBe(1);
  expect(binds[3].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[0].binds[0].contextParam).toEqual({indexes:[0], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[0].binds[0].indexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].indexesString).toBe("0");
  expect(binds[3].templateChildren[0].binds[0].viewModelPropertyKey).toBe("ddd.*\t0");
  expect(binds[3].templateChildren[0].binds[0].contextIndexes).toEqual([0]);
  expect(binds[3].templateChildren[0].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[0].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
  expect(binds[3].templateChildren[0].binds[0].context).toEqual({ indexes:[0], stack:[{indexes:[0], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[3].templateChildren[1].context).toEqual({
    indexes:[1],
    stack:[
      {
        indexes:[1], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(binds[3].templateChildren[1].binds.length).toBe(1);
  expect(binds[3].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[1].binds[0].contextParam).toEqual({indexes:[1], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[1].binds[0].indexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].indexesString).toBe("1");
  expect(binds[3].templateChildren[1].binds[0].viewModelPropertyKey).toBe("ddd.*\t1");
  expect(binds[3].templateChildren[1].binds[0].contextIndexes).toEqual([1]);
  expect(binds[3].templateChildren[1].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[1].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
  expect(binds[3].templateChildren[1].binds[0].context).toEqual({ indexes:[1], stack:[{indexes:[1], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[3].templateChildren[2].context).toEqual({
    indexes:[2],
    stack:[
      {
        indexes:[2], pos:0, propName:PropertyName.create("ddd")
      }
    ]
  });
  expect(binds[3].templateChildren[2].binds.length).toBe(1);
  expect(binds[3].templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[2].binds[0].contextParam).toEqual({indexes:[2], pos:0, propName:PropertyName.create("ddd")});
  expect(binds[3].templateChildren[2].binds[0].indexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].indexesString).toBe("2");
  expect(binds[3].templateChildren[2].binds[0].viewModelPropertyKey).toBe("ddd.*\t2");
  expect(binds[3].templateChildren[2].binds[0].contextIndexes).toEqual([2]);
  expect(binds[3].templateChildren[2].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[2].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
  expect(binds[3].templateChildren[2].binds[0].context).toEqual({ indexes:[2], stack:[{indexes:[2], pos:0, propName:PropertyName.create("ddd")}] });

  expect(binds[4] instanceof LevelTop).toBe(true);
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
  expect(binds[4].contextIndexes).toEqual([]);
  expect(binds[4].lastNodeValue).toBe(undefined);
  expect(binds[4].lastViewModelValue).toBe("400");
  expect(binds[4].context).toEqual({ indexes:[], stack:[] });
});

test("Binder context", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);

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
    }
  };
  const contextBind = new BindInfo();
  const binds = Binder.bind(nodes, component, { 
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });
  expect(binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[0].lastNodeValue).toBe(undefined);
  expect(binds[0].lastViewModelValue).toBe("100");
  expect(binds[0].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[1] instanceof LevelTop).toBe(true);
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
  expect(binds[1].lastNodeValue).toBe(undefined);
  expect(binds[1].lastViewModelValue).toBe("200");
  expect(binds[1].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[2] instanceof LevelTop).toBe(true);
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
  expect(binds[2].lastNodeValue).toBe(undefined);
  expect(binds[2].lastViewModelValue).toBe("300");
  expect(binds[2].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

  expect(binds[3] instanceof TemplateBind).toBe(true);
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
  expect(binds[3].lastNodeValue).toBe(undefined);
  expect(binds[3].lastViewModelValue).toEqual(["1", "2", "3"]);
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
  expect(binds[3].templateChildren[0].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[0].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[0].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
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
  expect(binds[3].templateChildren[1].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[1].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[1].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
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
  expect(binds[3].templateChildren[2].binds[0] instanceof LevelTop).toBe(true);
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
  expect(binds[3].templateChildren[2].binds[0].lastNodeValue).toBe(undefined);
  expect(binds[3].templateChildren[2].binds[0].lastViewModelValue).toBe(undefined); // ToDo:おかしくね？
  expect(binds[3].templateChildren[2].binds[0].context).toEqual({
    indexes:[1, 2],
    stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") },
      { indexes:[2], pos:1, propName:PropertyName.create("ddd") }
    ]
  });

  expect(binds[4] instanceof LevelTop).toBe(true);
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
  expect(binds[4].lastNodeValue).toBe(undefined);
  expect(binds[4].lastViewModelValue).toBe("400");
  expect(binds[4].context).toEqual({
    indexes:[1], stack:[
      { indexes:[1], pos:0, propName:PropertyName.create("fff") }
    ]
  });

});

test("Binder indexes fail", () => {
  const div = document.createElement("div");
  div.innerHTML = `
<div data-bind="aaa"></div>
<div data-bind="bbb"></div>
<div data-bind="ccc"></div>
<template data-bind="loop:ddd">
  <div data-bind="ddd.*"></div>
</template>
<!--@@eee-->
  `;
  const elements = Array.from(div.querySelectorAll("[data-bind]"));
  const comments = [];
  const traverse = (node, list) => {
    if (node instanceof Comment) list.push(node);
    for(const childNode of Array.from(node.childNodes)) {
      traverse(childNode, list);
    }
  };
  traverse(div, comments);
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
