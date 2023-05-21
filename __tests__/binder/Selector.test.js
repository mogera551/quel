import { Selector } from "../../src/binder/Selector.js";
import { Module } from "../../src/component/Module.js";
import { Templates } from "../../src/view/Templates.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

test("Selector", () => {
  const html = `
<div data-bind="aaa"></div>
{{ bbb }}
{{ loop:ccc }}
  <div data-bind="ccc.*"></div>
{{ end: }}
  `;
  const template = Module.htmlToTemplate(html);
  const rootElement = document.createElement("div");
  rootElement.appendChild(template.content.cloneNode(true));

  const nodes = Selector.getTargetNodes(template, rootElement);
  expect(nodes.length).toBe(3);
  expect(nodes[0].tagName).toBe("DIV");
  expect(nodes[0].dataset.bind).toBe("aaa");
  expect(nodes[1].textContent).toBe("@@:bbb");
  expect(nodes[2].textContent).toBe("@@|xxxx-xxxx-xxxx-xxxx-0");

  const rootElement2 = document.createElement("div");
  rootElement2.appendChild(template.content.cloneNode(true));
  const nodes2 = Selector.getTargetNodes(template, rootElement2);
  expect(nodes2[0].tagName).toBe("DIV");
  expect(nodes2[0].dataset.bind).toBe("aaa");
  expect(nodes2[1].textContent).toBe("@@:bbb");
  expect(nodes2[2].textContent).toBe("@@|xxxx-xxxx-xxxx-xxxx-0");
});