import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Binding } from "../../../src/binding/Binding.js";
import { ViewModelProperty } from "../../../src/binding/ViewModelProperty.js";
import { Repeat } from "../../../src/binding/nodePoperty/Repeat.js";
import { Templates } from "../../../src/view/Templates.js";

const binding = {
  children: [],
  context: { indexes:[], stack:[] },
};

class ViewModel {
  aaa = [];
}

const component = {
  filters: { in:{}, out:{} },
  viewModel: new ViewModel,
}
const html = `
<div data-id="bbb">hello world</div>
`;

const template = document.createElement("template");
template.innerHTML = html;

Templates.templateByUUID.set("12345", template);

const context = { indexes:[], stack:[] };

test("Repeat", () => {
  const node = document.createComment("@@:12345");
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(node);
  const binding = new Binding(component, context, node, "loop", Repeat, component.viewModel, "aaa", ViewModelProperty, []);
  const repeat = binding.nodeProperty;
  expect(repeat.binding).toBe(binding);
  expect(repeat.node).toBe(node);
  expect(repeat.name).toBe("loop");
  expect(repeat.nameElements).toEqual(["loop"]);
  expect(repeat.filters).toEqual([]);
  expect(repeat.filterFuncs).toEqual({});
  expect(repeat.applicable).toBe(true);
  expect(repeat.value).toBe(0);

  {
    repeat.value = [1];
    expect(repeat.value).toBe(1);
    const appendDivs = parentNode.querySelectorAll("[data-id='bbb']");
    expect(appendDivs.length).toBe(1);
    expect(binding.children.length).toBe(1);
    expect(binding.children[0].nodes.length > 0).toBe(true);
    expect(binding.children[0].context).toEqual({ indexes:[0], stack:[{ indexes:[0], propName:PropertyName.create("aaa"), pos:0 }] });
  }
  {
    repeat.value = [];
    expect(repeat.value).toBe(0);
    const appendDivs = parentNode.querySelectorAll("[data-id='bbb']");
    expect(appendDivs.length).toBe(0);
  }
  {
    repeat.value = [1,2];
    expect(repeat.value).toBe(2);
    const appendDivs = parentNode.querySelectorAll("[data-id='bbb']");
    expect(appendDivs.length).toBe(2);
    expect(binding.children[0].nodes.length > 0).toBe(true);
    expect(binding.children[0].context).toEqual({ indexes:[0], stack:[{ indexes:[0], propName:PropertyName.create("aaa"), pos:0 }] });
    expect(binding.children[1].nodes.length > 0).toBe(true);
    expect(binding.children[1].context).toEqual({ indexes:[1], stack:[{ indexes:[1], propName:PropertyName.create("aaa"), pos:0 }] });
  }
  {
    repeat.value = [1,2,3];
    expect(repeat.value).toBe(3);
    const appendDivs = parentNode.querySelectorAll("[data-id='bbb']");
    expect(appendDivs.length).toBe(3);
    expect(binding.children[0].nodes.length > 0).toBe(true);
    expect(binding.children[0].context).toEqual({ indexes:[0], stack:[{ indexes:[0], propName:PropertyName.create("aaa"), pos:0 }] });
    expect(binding.children[1].nodes.length > 0).toBe(true);
    expect(binding.children[1].context).toEqual({ indexes:[1], stack:[{ indexes:[1], propName:PropertyName.create("aaa"), pos:0 }] });
    expect(binding.children[2].nodes.length > 0).toBe(true);
    expect(binding.children[2].context).toEqual({ indexes:[2], stack:[{ indexes:[2], propName:PropertyName.create("aaa"), pos:0 }] });
  }
  {
    repeat.value = [1,2,3];
    expect(repeat.value).toBe(3);
    const appendDivs = parentNode.querySelectorAll("[data-id='bbb']");
    expect(appendDivs.length).toBe(3);
    expect(binding.children[0].nodes.length > 0).toBe(true);
    expect(binding.children[0].context).toEqual({ indexes:[0], stack:[{ indexes:[0], propName:PropertyName.create("aaa"), pos:0 }] });
    expect(binding.children[1].nodes.length > 0).toBe(true);
    expect(binding.children[1].context).toEqual({ indexes:[1], stack:[{ indexes:[1], propName:PropertyName.create("aaa"), pos:0 }] });
    expect(binding.children[2].nodes.length > 0).toBe(true);
    expect(binding.children[2].context).toEqual({ indexes:[2], stack:[{ indexes:[2], propName:PropertyName.create("aaa"), pos:0 }] });
  }
  {
    expect(() => {
      repeat.value = 100;
    }).toThrow("value is not array"); 
  }
});

test("Repeat fail", () => {
  const node = document.createComment("@@:12345");
  const parentNode = document.createDocumentFragment();
  parentNode.appendChild(node);
  expect(() => {
    const binding = new Binding(component, { indexes:[], stack:[] }, node, "if", Repeat, {}, "", ViewModelProperty, []);
  }).toThrow("invalid property name if")
});