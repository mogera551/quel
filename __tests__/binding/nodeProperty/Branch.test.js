import { Binding } from "../../../src/binding/Binding.js";
import { ViewModelProperty } from "../../../src/binding/ViewModelProperty.js";
import { Branch } from "../../../src/binding/nodePoperty/Branch.js";
import { Templates } from "../../../src/view/Templates.js";

const binding = {
  children: [],
  context: { indexes:[], stack:[] },
};

const component = {
  filters: { in:{}, out:{} }
}
const html = `
<div data-id="aaa">hello world</div>
`;

const template = document.createElement("template");
template.innerHTML = html;

Templates.templateByUUID.set("12345", template);

test("Branch", () => {
  const node = document.createComment("@@:12345");
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(node);
  const binding = new Binding(component, { indexes:[], stack:[] }, node, "if", Branch, {}, "", ViewModelProperty, []);
  const branch = binding.nodeProperty;
  expect(branch.binding).toBe(binding);
  expect(branch.node).toBe(node);
  expect(branch.name).toBe("if");
  expect(branch.nameElements).toEqual(["if"]);
  expect(branch.filters).toEqual([]);
  expect(branch.filterFuncs).toEqual({});
  expect(branch.applicable).toBe(true);
  expect(branch.expandable).toBe(true);
  expect(branch.value).toBe(false);

  {
    branch.value = true;
    expect(branch.value).toBe(true);
    const appendDivs = parentNode.querySelectorAll("[data-id='aaa']");
    expect(appendDivs.length).toBe(1);
    expect(binding.children.length).toBe(1);
    expect(binding.children[0].nodes.length > 0).toBe(true);
    expect(binding.children[0].context).toEqual(binding.context);
    expect(binding.children[0].context === binding.context).toBe(false);
  }
  {
    branch.value = false;
    expect(branch.value).toBe(false);
    const appendDivs = parentNode.querySelectorAll("[data-id='aaa']");
    expect(appendDivs.length).toBe(0);
  }
  {
    branch.value = true;
    expect(branch.value).toBe(true);
    const appendDivs = parentNode.querySelectorAll("[data-id='aaa']");
    expect(appendDivs.length).toBe(1);
  }
  {
    branch.value = true;
    expect(branch.value).toBe(true);
    const appendDivs = parentNode.querySelectorAll("[data-id='aaa']");
    expect(appendDivs.length).toBe(1);
  }
  {
    expect(() => {
      branch.value = "true";
    }).toThrow("value is not boolean"); 
  }
});

test("Branch fail", () => {
  const node = document.createComment("@@:12345");
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(node);
  expect(() => {
    const binding = new Binding(component, { indexes:[], stack:[] }, node, "loop", Branch, {}, "", ViewModelProperty, []);
  }).toThrow("invalid property name loop")
});