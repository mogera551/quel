import { Symbols } from "../../src/Symbols.js";
import { generateComponentClass } from "../../src/component/Component.js";

test("Component generateComponentClass", () => {
  const html = ``;
  class ViewModel {

  }
  const ComponentEx = generateComponentClass({ html, ViewModel });
  customElements.define("a-b", ComponentEx);
  const ab = document.createElement("a-b");
  expect(ab[Symbols.isComponent]).toBe(true);

  const template = document.createElement("template");
  template.innerHTML = html;

  expect(ComponentEx.template).toEqual(template);
  expect(ComponentEx.ViewModel).toBe(ViewModel);

});

const Sleep = async (msec) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
}

test("Component ", async () => {
  const html = `<div data-bind="aaa" class="aaa"></div>`;
  class ViewModel {
    "aaa" = 100;
  }
  const ComponentEx = generateComponentClass({ html, ViewModel });
  customElements.define("aaa-bbb", ComponentEx);
  const template = document.createElement("template");
  template.innerHTML = "<aaa-bbb></aaa-bbb>";
  const root = document.createElement("div");
  root.appendChild(document.importNode(template.content, true));
  /**
   * @type {Component}
   */
  const component = root.querySelector("aaa-bbb");
  expect(component[Symbols.isComponent]).toBe(true);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  expect(component.viewModel != null).toBe(true);
  expect(component.binds != null).toBe(true);
  expect(component.thread != null).toBe(true);
  const aaa = component.viewRootElement.querySelector(".aaa");
  expect(aaa.textContent).toBe("100");
  let disconnected = false;
  setTimeout(() => {
    disconnected = true;
    component.disconnectedCallback();
  }, 10);
  await component.alivePromise;
  expect(disconnected).toBe(true);

});

test("Component ", async () => {
  const html = `<input data-bind="aaa" class="aaa"></div>`;
  class ViewModel {
    "aaa" = 100;
  }
  const ComponentEx = generateComponentClass({ html, ViewModel });
  customElements.define("aaa-ccc", ComponentEx);
  const template = document.createElement("template");
  template.innerHTML = "<aaa-ccc></aaa-bbb>";
  const root = document.createElement("div");
  root.appendChild(document.importNode(template.content, true));
  /**
   * @type {Component}
   */
  const component = root.querySelector("aaa-ccc");
  expect(component[Symbols.isComponent]).toBe(true);
  setTimeout(async () => {
    await component.connectedCallback();
  }, 100);
  await component.initialPromise;
  expect(component.viewModel != null).toBe(true);
  expect(component.binds != null).toBe(true);
  expect(component.thread != null).toBe(true);
  const aaa = component.viewRootElement.querySelector(".aaa");

  expect(aaa.value).toBe("100");
  aaa.value = "111";
  const event = new Event('input');
  aaa.dispatchEvent(event);
  await Sleep(10);
  expect(component.viewModel.aaa).toBe("111");

  let disconnected = false;
  setTimeout(() => {
    disconnected = true;
    component.disconnectedCallback();
  }, 10);
  await component.alivePromise;
  expect(disconnected).toBe(true);

});

test("Component parentComponent", async () => {
  const parentHtml = `<div data-bind="aaa" class="aaa"></div><child-tag></child-tag>`;
  class ParentViewModel {
    "aaa" = "1000";

  }
  customElements.define("parent-tag", generateComponentClass({ html:parentHtml, ViewModel:ParentViewModel }));

  const childHtml = `<div data-bind="aaa" class="aaa"></div>`;
  class ChildViewModel {
    "aaa" = "100";
  }
  customElements.define("child-tag", generateComponentClass({ html:childHtml, ViewModel:ChildViewModel }));

  const root = document.createElement("div");
  root.innerHTML = `
  <parent-tag></parent-tag>
  `;
  const parentComponent = root.querySelector("parent-tag");

  let connectedCallbacked = false;
  setTimeout(async () => {
    connectedCallbacked = true;
    await parentComponent.connectedCallback();
  }, 1);
  await parentComponent.initialPromise;
  expect(connectedCallbacked).toBe(true);

  const childComponent = parentComponent.viewRootElement.querySelector("child-tag");
  connectedCallbacked = false;
  setTimeout(async () => {
    connectedCallbacked = true;
    await childComponent.connectedCallback();
  }, 1);
  await childComponent.initialPromise;
  expect(connectedCallbacked).toBe(true);

});

test("Component parentComponent shadow-root", async () => {
  const parentHtml = `<div data-bind="aaa" class="aaa"></div><child-tag2></child-tag2>`;
  class ParentViewModel {
    "aaa" = "1000";

  }
  customElements.define("parent-tag2", generateComponentClass({ html:parentHtml, ViewModel:ParentViewModel }));

  const childHtml = `<div data-bind="aaa" class="aaa"></div>`;
  class ChildViewModel {
    "aaa" = "100";
  }
  customElements.define("child-tag2", generateComponentClass({ html:childHtml, ViewModel:ChildViewModel }));

  const root = document.createElement("div");
  root.attachShadow({mode:'open'});
  root.shadowRoot.innerHTML = `
  <parent-tag2></parent-tag2>
  `;
  const parentComponent = root.shadowRoot.querySelector("parent-tag2");

  let connectedCallbacked = false;
  setTimeout(async () => {
    connectedCallbacked = true;
    await parentComponent.connectedCallback();
  }, 1);
  await parentComponent.initialPromise;
  expect(connectedCallbacked).toBe(true);

  const childComponent = parentComponent.viewRootElement.querySelector("child-tag2");
  connectedCallbacked = false;
  setTimeout(async () => {
    connectedCallbacked = true;
    await childComponent.connectedCallback();
  }, 1);
  await childComponent.initialPromise;
  expect(connectedCallbacked).toBe(true);

});

test("Component customized builtin", async () => {
  const extendModule = {html:"{{aaa}}", ViewModel:class { aaa = 100; }, extendClass:HTMLDivElement, extendTag:"div"};
  const extendClass = generateComponentClass(extendModule);

  customElements.define("extend-div", extendClass, { extends:extendModule.extendTag });

  const root = document.createElement("div");
  root.innerHTML = "<div class='a' is='extend-div'></div>";
  document.body.appendChild(root);
  const extendDiv = root.querySelector("div.a");
  await extendDiv.initialPromise;
  expect(extendDiv[Symbols.isComponent]).toBe(true);
  expect(extendDiv instanceof HTMLDivElement).toBe(true);
  expect(extendDiv.withShadowRoot).toBe(false);
  expect(extendDiv.textContent).toBe("100");
  expect(extendDiv.shadowRoot == null).toBe(true);
  expect(extendDiv.viewRootElement === extendDiv).toBe(true);

});

test("Component customized builtin with-hadow-root", async () => {
  const extendModule = {html:"{{aaa}}", ViewModel:class { aaa = 100; }, extendClass:HTMLDivElement, extendTag:"div"};
  const extendClass = generateComponentClass(extendModule);

  customElements.define("extend-div2", extendClass, { extends:extendModule.extendTag });

  const root = document.createElement("div");
  root.innerHTML = "<div class='a' is='extend-div2' with-shadow-root></div>";
  document.body.appendChild(root);
  const extendDiv = root.querySelector("div.a");
  await extendDiv.initialPromise;
  expect(extendDiv[Symbols.isComponent]).toBe(true);
  expect(extendDiv instanceof HTMLDivElement).toBe(true);
  expect(extendDiv.withShadowRoot).toBe(true);
  expect(extendDiv.shadowRoot != null).toBe(true);
  expect(extendDiv.shadowRoot.host === extendDiv).toBe(true);
  expect(extendDiv.viewRootElement !== extendDiv).toBe(true);

});
