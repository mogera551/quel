import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Binding, ChildBinding } from "../../src/binding/Binding.js";
import { Factory } from "../../src/binding/Factory.js";
import { Branch } from "../../src/binding/nodeProperty/Branch.js";
import { Checkbox } from "../../src/binding/nodeProperty/Checkbox.js";
import { ComponentProperty } from "../../src/binding/nodeProperty/ComponentProperty.js";
import { ElementAttribute } from "../../src/binding/nodeProperty/ElementAttribute.js";
import { ElementClass } from "../../src/binding/nodeProperty/ElementClass.js";
import { ElementClassName } from "../../src/binding/nodeProperty/ElementClassName.js";
import { ElementEvent } from "../../src/binding/nodeProperty/ElementEvent.js";
import { ElementProperty } from "../../src/binding/nodeProperty/ElementProperty.js";
import { ElementStyle } from "../../src/binding/nodeProperty/ElementStyle.js";
import { NodeProperty } from "../../src/binding/nodeProperty/NodeProperty.js";
import { Radio } from "../../src/binding/nodeProperty/Radio.js";
import { Repeat } from "../../src/binding/nodeProperty/Repeat.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";
import { Symbols } from "../../src/Symbols.js";
import { utils } from "../../src/utils.js";
import { Templates } from "../../src/view/Templates.js";
import { createProps } from "../../src/component/Props.js";

/** @type {Component} */
const component = {
  filters: {
    in:{},
    out:{},
  },
  updateSlot:{
    addNodeUpdate:(update) => {
      Reflect.apply(update.updateFunc, update, []);
    },
    addProcess:(process) => {
      Reflect.apply(process.target, process.thisArgument, process.argumentsList);
    },
  },
  props: createProps(this),
};

class ViewModel {
  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   */
  [Symbols.directlyGet](name, indexes) {
    const propertyName = PropertyName.create(name);
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
   * @param {string} name 
   * @param {number[]} indexes 
   * @param {any} value
   */
  [Symbols.directlySet](name, indexes, value) {
    const propertyName = PropertyName.create(name);
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
  /**
   * @param {string} name 
   * @param {ContextInfo} context
   * @param {Event} event
   */
  [Symbols.directlyCall](name, context, event) {
    Reflect.apply(this[name], this, [event, ...context.indexes]);
  }

}

test("binding/Factory node", () => {
  const node = document.createTextNode("");
  component.viewModel = new (class extends ViewModel {
    prop = 100;
  });
  const binding = Factory.create(component, node, "textContent", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(NodeProperty);
  expect(binding.nodeProperty.node).toBe(node);
  expect(binding.nodeProperty.name).toBe("textContent");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(node.textContent).toBe("100");
});

test("binding/Factory element", () => {
  const element = document.createElement("div");
  component.viewModel = new (class extends ViewModel {
    prop = 100;
  });
  const binding = Factory.create(component, element, "textContent", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementProperty);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("textContent");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.textContent).toBe("100");
});

test("binding/Factory class", () => {
  const element = document.createElement("div");
  component.viewModel = new (class extends ViewModel {
    prop = ["aaa", "bbb"];
  });
  const binding = Factory.create(component, element, "class", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementClassName);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("class");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.className).toBe("aaa bbb");
});

test("binding/Factory checkbox", () => {
  const element = document.createElement("input",);
  element.type = "checkbox";
  element.value = "100";
  component.viewModel = new (class extends ViewModel {
    prop = ["100", "200"];
  });
  const binding = Factory.create(component, element, "checkbox", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Checkbox);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("checkbox");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.checked).toBe(true);
});

test("binding/Factory radio", () => {
  const element = document.createElement("input",);
  element.type = "radio";
  element.value = "100";
  component.viewModel = new (class extends ViewModel {
    prop = "100";
  });
  const binding = Factory.create(component, element, "radio", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Radio);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("radio");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.checked).toBe(true);
});

test("binding/Factory event", () => {
  const button = document.createElement("button");
  let result = "no exec";
  component.viewModel = new (class extends ViewModel {
    handler() {
      result = "exec";
    }
  });
  const binding = Factory.create(component, button, "onclick", component.viewModel, "handler", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementEvent);
  expect(binding.nodeProperty.node).toBe(button);
  expect(binding.nodeProperty.name).toBe("onclick");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("handler");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(result).toBe("no exec");
  button.dispatchEvent(new Event('click'));
  expect(result).toBe("exec");

});

test("binding/Factory class.", () => {
  const element = document.createElement("div");
  component.viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, element, "class.selected", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementClass);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("class.selected");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.classList.contains("selected")).toBe(true);
});

test("binding/Factory attr.", () => {
  const element = document.createElement("div");
  component.viewModel = new (class extends ViewModel {
    prop = "cccc";
  });
  const binding = Factory.create(component, element, "attr.title", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementAttribute);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("attr.title");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.getAttribute("title")).toBe("cccc");
});

test("binding/Factory style.", () => {
  const element = document.createElement("div");
  component.viewModel = new (class extends ViewModel {
    prop = "red";
  });
  const binding = Factory.create(component, element, "style.color", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ElementStyle);
  expect(binding.nodeProperty.node).toBe(element);
  expect(binding.nodeProperty.name).toBe("style.color");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);

  expect(element.style.color).toBe("red");
});

const template = document.createElement("template");
const uuid = utils.createUUID();
Templates.templateByUUID.set(uuid, template);

test("binding/Factory Branch", () => {
  const comment = document.createComment("@@|" + uuid);
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(comment);
  component.viewModel = new (class extends ViewModel {
    prop = true;
  });
  const binding = Factory.create(component, comment, "if", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Branch);
  expect(binding.nodeProperty.node).toBe(comment);
  expect(binding.nodeProperty.name).toBe("if");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);
});

test("binding/Factory Repeat", () => {
  const comment = document.createComment("@@|" + uuid);
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(comment);
  component.viewModel = new (class extends ViewModel {
    prop = [];
  });
  const binding = Factory.create(component, comment, "loop", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(Repeat);
  expect(binding.nodeProperty.node).toBe(comment);
  expect(binding.nodeProperty.name).toBe("loop");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("prop");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);
});

test("binding/Factory fail template", () => {
  const comment = document.createComment("@@|" + uuid);
  component.viewModel = new (class extends ViewModel {
    prop = true;
  });
  expect(() => {
    const binding = Factory.create(component, comment, "block", component.viewModel, "prop", [], {indexes:[],stack:[]} );
  }).toThrow("unknown node property block")
});

test("", () => {
  const childComponentBase = {
    filters: {
      in:{},
      out:{},
    },
    updateSlot:{
      addNodeUpdate:(update) => {
        Reflect.apply(update.updateFunc, update, []);
      },
      addProcess:(process) => {
        Reflect.apply(process.target, process.thisArgument, process.argumentsList);
      },
    },
    props: createProps(this),
    [Symbols.isComponent]:true,
    viewModel: {
    }
  };
  component.viewModel = new (class extends ViewModel {
    aaa = 100;
  });
  const div = document.createElement("div");
  const childComponent = Object.assign(div, childComponentBase);
  const binding = Factory.create(component, childComponent, "props.aaa", component.viewModel, "bbb", [], {indexes:[],stack:[]} );
  expect(binding.constructor).toBe(Binding);
  expect(binding.component).toBe(component);
  expect(binding.nodeProperty.constructor).toBe(ComponentProperty);
  expect(binding.nodeProperty.node).toBe(childComponent);
  expect(binding.nodeProperty.name).toBe("props.aaa");
  expect(binding.nodeProperty.filters).toEqual([]);
  expect(binding.nodeProperty.filterFuncs).toEqual({});
  expect(binding.viewModelProperty.constructor).toBe(ViewModelProperty);
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("bbb");
  expect(binding.viewModelProperty.filters).toEqual([]);
  expect(binding.viewModelProperty.filterFuncs).toEqual({});
  expect(binding.context).toEqual({indexes:[],stack:[]});
  expect(binding.contextParam).toBe(undefined);
  
})
