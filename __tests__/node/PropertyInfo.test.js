import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodePropertyInfo } from "../../src/node/PropertyInfo.js";
import { generateComponentClass } from "../../src/component/Component.js";

const minimumModule = {html:"", ViewModel:class {}};
customElements.define("custom-tag", generateComponentClass(minimumModule));

test('PropertyType Template', () => {

  const templateNode = document.createComment("@@|xxxx-xxxx-xxxx-xxxx-0");
  expect(NodePropertyInfo.get(templateNode, "if")).toEqual({
    type:NodePropertyType.template,
    nodePropertyElements:["if"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(templateNode, "loop")).toEqual({
    type:NodePropertyType.template,
    nodePropertyElements:["loop"],
    eventType:undefined,
  });
  expect(() => NodePropertyInfo.get(templateNode, "value")).toThrow("template illegal property value");

  const textNode = document.createTextNode("text-node");
  expect(NodePropertyInfo.get(textNode, "textContent")).toEqual({
    type:NodePropertyType.text,
    nodePropertyElements:["textContent"],
    eventType:undefined,
  });
  expect(() => NodePropertyInfo.get(textNode, "text")).toThrow("unknown node text or property text");

  const component = document.createElement("custom-tag");
  expect(NodePropertyInfo.get(component, "props.value")).toEqual({
    type:NodePropertyType.component,
    nodePropertyElements:["props", "value"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(component, "value")).toEqual({
    type:NodePropertyType.property,
    nodePropertyElements:["value"],
    eventType:undefined,
  });
  
  const div = document.createElement("div");
  expect(NodePropertyInfo.get(div, "textContent")).toEqual({
    type:NodePropertyType.property,
    nodePropertyElements:["textContent"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "style.display")).toEqual({
    type:NodePropertyType.style,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "attr.title")).toEqual({
    type:NodePropertyType.attribute,
    nodePropertyElements:["attr", "title"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "class")).toEqual({
    type:NodePropertyType.className,
    nodePropertyElements:["class"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "class.completed")).toEqual({
    type:NodePropertyType.classList,
    nodePropertyElements:["class", "completed"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "onclick")).toEqual({
    type:NodePropertyType.event,
    nodePropertyElements:["onclick"],
    eventType:"click",
  });
  expect(() => NodePropertyInfo.get(div, "aaa.bbb")).toThrow("unknown property aaa.bbb");
  expect(() => NodePropertyInfo.get(div, "aaa.bbb.ccc.ddd")).toThrow("unknown property aaa.bbb.ccc.ddd");

  const radio = document.createElement("input");
  radio.type = "radio";
  expect(NodePropertyInfo.get(radio, "checked")).toEqual({
    type:NodePropertyType.property,
    nodePropertyElements:["checked"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(radio, "style.display")).toEqual({
    type:NodePropertyType.style,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(radio, "radio")).toEqual({
    type:NodePropertyType.radio,
    nodePropertyElements:["radio"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "attr.title")).toEqual({
    type:NodePropertyType.attribute,
    nodePropertyElements:["attr", "title"],
    eventType:undefined,
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  expect(NodePropertyInfo.get(checkbox, "checked")).toEqual({
    type:NodePropertyType.property,
    nodePropertyElements:["checked"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(checkbox, "style.display")).toEqual({
    type:NodePropertyType.style,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(checkbox, "checkbox")).toEqual({
    type:NodePropertyType.checkbox,
    nodePropertyElements:["checkbox"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "attr.title")).toEqual({
    type:NodePropertyType.attribute,
    nodePropertyElements:["attr", "title"],
    eventType:undefined,
  });

});
