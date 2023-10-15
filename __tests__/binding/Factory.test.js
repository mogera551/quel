import { Binding, Bindings } from "../../src/binding/Binding.js";
import { BranchBinding } from "../../src/binding/BranchBinding.js";
import { Factory } from "../../src/binding/Factory.js";
import { Checkbox } from "../../src/binding/nodePoperty/Checkbox.js";
import { ElementAttribute } from "../../src/binding/nodePoperty/ElementAttribute.js";
import { ElementClass } from "../../src/binding/nodePoperty/ElementClass.js";
import { ElementClassName } from "../../src/binding/nodePoperty/ElementClassName.js";
import { ElementEvent } from "../../src/binding/nodePoperty/ElementEvent.js";
import { ElementProperty } from "../../src/binding/nodePoperty/ElementProperty.js";
import { ElementStyle } from "../../src/binding/nodePoperty/ElementStyle.js";
import { NodeProperty } from "../../src/binding/nodePoperty/NodeProperty.js";
import { Radio } from "../../src/binding/nodePoperty/Radio.js";
import { TemplateProperty } from "../../src/binding/nodePoperty/TemplateProperty.js";
import { RepeatBinding } from "../../src/binding/RepeatBinding.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";
import { Symbols } from "../../src/Symbols.js";
import { utils } from "../../src/utils.js";
import { Templates } from "../../src/view/Templates.js";

/** @type {Component} */
const component = {
  inputFilters:{},
  outputFilters:{},

};

class ViewModel {
  /**
   * 
   * @param {PropertyName} propertyName 
   * @param {number[]} indexes 
   */
  [Symbols.directlyGet](propertyName, indexes) {
    let index = indexes.length - 1;
    const getter = (paths) => {
      if (paths.length === 0) return this;
      let last = paths.pop();
      if (last === "*") {
        last = indexes[index];
        index--;
      }
      return getter(paths)[last];
    }
    return getter(propertyName.pathNames.slice());
  }

  /**
   * 
   * @param {PropertyName} propertyName 
   * @param {number[]} indexes 
   * @param {any} value
   */
  [Symbols.directlySet](propertyName, indexes, value) {
    let index = indexes.length - 1;
    let last = propertyName.lastPathName;
    if (last === "*") {
      last = indexes[index];
      index--;
    }
    const getter = (paths) => {
      if (paths.length === 0) return this;
      let last = paths.pop();
      if (last === "*") {
        last = indexes[index];
        index--;
      }
      return getter(paths)[last];
    }
    getter(propertyName.parentPathNames.slice())[last] = value;
  }

}

test("binding/Factory node", () => {
  const node = document.createTextNode("");
  const viewModel = new (class extends ViewModel {
    prop = 100;
  });
  const binding = Factory.create(component, node, "textContent", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(NodeProperty);
  expect(binding.nodeProperty.node).toBe(node);
  expect(binding.nodeProperty.name).toBe("textContent");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory element", () => {
  const element = document.createElement("div");
  const viewModel = new (class extends ViewModel {
    prop = 100;
  });
  const binding = Factory.create(component, element, "textContent", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementProperty);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("textContent");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory class", () => {
  const element = document.createElement("div");
  const viewModel = new (class extends ViewModel {
    prop = [100, 200];
  });
  const binding = Factory.create(component, element, "class", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementClassName);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("class");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory checkbox", () => {
  const element = document.createElement("input",);
  element.type = "checkbox";
  const viewModel = new (class extends ViewModel {
    prop = [100, 200];
  });
  const binding = Factory.create(component, element, "checkbox", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Checkbox);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("checkbox");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory radio", () => {
  const element = document.createElement("input",);
  element.type = "radio";
  const viewModel = new (class extends ViewModel {
    prop = [100, 200];
  });
  const binding = Factory.create(component, element, "radio", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Radio);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("radio");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory event", () => {
  const element = document.createElement("input",);
  element.type = "radio";
  const viewModel = new (class extends ViewModel {
    prop = [100, 200];
    popup() {
      alert("");
    }
  });
  const binding = Factory.create(component, element, "onclick", viewModel, "popup", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementEvent);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("onclick");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("popup");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory class.", () => {
  const element = document.createElement("div");
  const viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, element, "class.selected", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementClass);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("class.selected");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory attr.", () => {
  const element = document.createElement("div");
  const viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, element, "attr.title", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementAttribute);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("attr.title");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory style.", () => {
  const element = document.createElement("div");
  const viewModel = new (class extends ViewModel {
    prop = "red";
  });
  const binding = Factory.create(component, element, "style.color", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementStyle);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("style.color");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

const template = document.createElement("template");
const uuid = utils.createUUID();
Templates.templateByUUID.set(uuid, template);
test("binding/Factory branchBinding", () => {
  const comment = document.createComment("@@|" + uuid);
  const viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, comment, "if", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(BranchBinding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(TemplateProperty);
  expect(binding.nodeProperty.node).toBe(comment);
  expect(binding.nodeProperty.name).toBe("if");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory repeatBinding", () => {
  const comment = document.createComment("@@|" + uuid);
  const viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, comment, "loop", viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(RepeatBinding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(TemplateProperty);
  expect(binding.nodeProperty.node).toBe(comment);
  expect(binding.nodeProperty.name).toBe("loop");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.context).toEqual({indexes:[],stack:[]});
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
});

test("binding/Factory fail template", () => {
  const comment = document.createComment("@@|" + uuid);
  const viewModel = new (class extends ViewModel {
    prop = true;
  });
  expect(() => {
    const binding = Factory.create(component, comment, "block", viewModel, "prop", [], {indexes:[],stack:[]} );
  }).toThrow("unknown node property block")
});
