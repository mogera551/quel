import { Selector } from "../../src/binder/Selector.js";

test("Selector", () => {
  const template = document.createElement("template");
  template.innerHTML = `
<div data-bind="aaa"></div>
<!--@@bbb-->
<template data-bind="loop:ccc">
  <div data-bind="ccc.*"></div>
</template>
  `;
  const rootElement = document.createElement("div");
  rootElement.appendChild(template.content.cloneNode(true));

  const nodes = Selector.getTargetNodes(template, rootElement);
  expect(nodes.length).toBe(3);
  expect(nodes[0].tagName).toBe("DIV");
  expect(nodes[0].dataset.bind).toBe("aaa");
  expect(nodes[1].tagName).toBe("TEMPLATE");
  expect(nodes[1].dataset.bind).toBe("loop:ccc");
  expect(nodes[2].textContent).toBe("@@bbb");

  const rootElement2 = document.createElement("div");
  rootElement2.appendChild(template.content.cloneNode(true));
  const nodes2 = Selector.getTargetNodes(template, rootElement2);
  expect(nodes2[0].tagName).toBe("DIV");
  expect(nodes2[0].dataset.bind).toBe("aaa");
  expect(nodes2[1].tagName).toBe("TEMPLATE");
  expect(nodes2[1].dataset.bind).toBe("loop:ccc");
  expect(nodes2[2].textContent).toBe("@@bbb");
});