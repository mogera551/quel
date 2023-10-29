import { Binding, Bindings } from "../../src/binding/Binding";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty";
import { Branch } from "../../src/binding/nodePoperty/Branch";
import { ElementEvent } from "../../src/binding/nodePoperty/ElementEvent";
import { ElementProperty } from "../../src/binding/nodePoperty/ElementProperty";
import { NodeProperty } from "../../src/binding/nodePoperty/NodeProperty";
import { generateComponentClass } from "../../src/component/Component";
import { Templates } from "../../src/view/Templates";


test("Binding/Binding applyToNode,applyToViewModel", async () => {
  const html = `
  <div data-id='aaa'></div>
  `;
  const ViewModel = class {
    message = "this is message";
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  const context = { indexes:[], stack:[]};
  const node = document.createTextNode("");

  const binding = new Binding(component, context, node, "textContent", NodeProperty, component.viewModel, "message", ViewModelProperty, []);
  expect(binding.nodeProperty.node).toBe(node);
  expect(binding.nodeProperty.name).toBe("textContent");
  expect(binding.viewModelProperty.viewModel).toBe(component.viewModel);
  expect(binding.viewModelProperty.name).toBe("message");
  expect(binding.component).toBe(component);
  expect(binding.context).toEqual(context);
  expect(binding.contextParam).toBe(undefined);
  expect(binding.children.length).toBe(0);
  expect(binding.expandable).toBe(false);

  {
    binding.applyToNode();
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(node.textContent).toBe("this is message");
        resolve();
      }, 100);
    });  
    await promise;
  }
  {
    node.textContent = "aaaaaaaa";
    binding.applyToViewModel();
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(component.viewModel.message).toBe("aaaaaaaa");
        resolve();
      }, 100);
    });
    await promise;
  }
  {
    binding.applyToNode();
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(node.textContent).toBe("aaaaaaaa");
        resolve();
      }, 100);
    });  
    await promise;
  }
  {
    binding.applyToViewModel();
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(node.textContent).toBe("aaaaaaaa");
        resolve();
      }, 100);
    });  
    await promise;
  }
});

test("Binding/Binding initialize,defaultEventHandler,updateNode", async () => {
  const html = `
  <div data-id='aaa'></div>
  `;
  const ViewModel = class {
    message = "this is message";
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag2";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  const context = { indexes:[], stack:[]};
  const element = document.createElement("input");
  const binding = new Binding(component, context, element, "value", ElementProperty, component.viewModel, "message", ViewModelProperty, []);
  {
    binding.initialize();
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(element.value).toBe("this is message");
        resolve();
      }, 100);
    });  
    await promise;
  }
  {
    element.value = "aaa";
    binding.defaultEventHandler(new Event("input"));
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(component.viewModel.message).toBe("aaa");
        resolve();
      }, 100);
    });  
    await promise;
  }
  {
    component.viewModel.message = "bbb";
    binding.updateNode(new Set(["message\t"]));
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(element.value).toBe("bbb");
        resolve();
      }, 100);
    });  
    await promise;
  }
  {
    component.viewModel.message = "ccc";
    binding.updateNode(new Set(["message2\t"]));
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(element.value).toBe("bbb");
        resolve();
      }, 100);
    });  
    await promise;
  }

});

test("Binding/Binding eventHandler", async () => {
  const html = `
  <div data-id='aaa'></div>
  `;
  let called = false;
  const ViewModel = class {
    change() {
      called = true;
    }
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag3";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  const context = { indexes:[], stack:[]};
  const element = document.createElement("button");
  const binding = new Binding(component, context, element, "onclick", ElementEvent, component.viewModel, "change", ViewModelProperty, []);
  {
    binding.initialize();
    expect(called).toBe(false);
    element.dispatchEvent(new Event("click"));
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        expect(called).toBe(true);
        resolve();
      }, 100);
    });  
    await promise;
  }

});

test("Binding/Binding appendChild", async () => {
  const html = `
  <div data-id='aaa'></div>
  `;
  let called = false;
  const ViewModel = class {
    aaa = false;
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag4";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  const context = { indexes:[], stack:[]};
  const comment = document.createComment("@@|1234");
  const parentNode = document.createElement("div");
  parentNode.appendChild(comment);
  const binding = new Binding(component, context, comment, "if", Branch, component.viewModel, "aaa", ViewModelProperty, []);
  {
    const uuid = "1234";
    const template = document.createElement("template");
    template.innerHTML = "<div></div>";
    const bindings = new Bindings(component, template, context);
    binding.appendChild(bindings);
    expect(bindings.nodes.length > 0).toBe(true);
    for(let i = 0, node = comment.nextSibling; i < bindings.nodes.length; node = node.nextSibling, i++) {
      expect(node).toBe(bindings.nodes[i]);
    }
  }

});

test("Binding/Binding appendChild fail", async () => {
  const html = `
  <div data-id='aaa'></div>
  `;
  let called = false;
  const ViewModel = class {
    aaa = false;
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag5";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  const context = { indexes:[], stack:[]};
  const element = document.createElement("div");
  const parentNode = document.createElement("div");
  parentNode.appendChild(element);
  const binding = new Binding(component, context, element, "textContent", ElementProperty, component.viewModel, "aaa", ViewModelProperty, []);
  {
    const uuid = "1234";
    const template = document.createElement("template");
    template.innerHTML = "<div></div>";
    const bindings = new Bindings(component, template, context);
    expect(() => {
      binding.appendChild(bindings);
    }).toThrow("not expandable");
  }

});

test("Binding/Bindings", async () => {
  const html = `
  <div data-bind='message'></div>
  `;
  let called = false;
  const ViewModel = class {
    message = "this is message";
    text = "this is text";
  };
  const classOfComponent = generateComponentClass({html, ViewModel});
  const customTagName = "custom-tag6";
  customElements.define(customTagName, classOfComponent);
  const component = document.createElement(customTagName);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;

  const template = document.createElement("template");
  template.innerHTML = "<div data-bind='text'></div>";

  const context = { indexes:[], stack:[]};
  const bindings = new Bindings(component, template, context);
  {
    expect(bindings.nodes.length > 0).toBe(true);
    let haveDiv = false;
    let lastNode = null;
    for(let i = 0; i < bindings.nodes.length; i++) {
      const node = bindings.nodes[i];
      if (node instanceof HTMLDivElement) {
        console.log(node.outerHTML);
        if (node.outerHTML === `<div data-bind="text"></div>`) {
          haveDiv = true;
        }
      }
      lastNode = node;
    }
    expect(haveDiv).toBe(true);
    expect(bindings.lastNode).toBe(lastNode);
    expect(bindings.fragment instanceof DocumentFragment).toBe(true);
    expect(Array.from(bindings.fragment.childNodes)).toEqual(bindings.nodes);
    expect(bindings.context).toEqual(context);
    expect(bindings.template).toBe(template);
  }


});