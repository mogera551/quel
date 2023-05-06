import { NodePropertyType } from "../../src/node/PropertyType.js";
import { NodePropertyInfo } from "../../src/node/PropertyInfo.js";
import { Component } from "../../src/component/Component.js";

customElements.define("custom-tag", Component);

test('PropertyType Template', () => {
  const template = document.createElement("template");
  expect(NodePropertyInfo.get(template, "if")).toEqual({
    type:NodePropertyType.template,
    nodePropertyElements:["if"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(template, "loop")).toEqual({
    type:NodePropertyType.template,
    nodePropertyElements:["loop"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(template, "value")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["value"],
    eventType:undefined,
  });

  const textNode = document.createTextNode("text-node");
  expect(NodePropertyInfo.get(textNode, "textContent")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["textContent"],
    eventType:undefined,
  });

  const component = document.createElement("custom-tag");
  expect(NodePropertyInfo.get(component, "$props.value")).toEqual({
    type:NodePropertyType.component,
    nodePropertyElements:["$props", "value"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(component, "value")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["value"],
    eventType:undefined,
  });
  
  const div = document.createElement("div");
  expect(NodePropertyInfo.get(div, "textContent")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["textContent"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "style.display")).toEqual({
    type:NodePropertyType.level2nd,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "className.completed")).toEqual({
    type:NodePropertyType.className,
    nodePropertyElements:["className", "completed"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "aaa.bbb.ccc")).toEqual({
    type:NodePropertyType.level3rd,
    nodePropertyElements:["aaa", "bbb", "ccc"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(div, "onclick")).toEqual({
    type:NodePropertyType.event,
    nodePropertyElements:["onclick"],
    eventType:"click",
  });
  expect(() => NodePropertyInfo.get(div, "aaa.bbb.ccc.ddd")).toThrow();

  const radio = document.createElement("input");
  radio.type = "radio";
  expect(NodePropertyInfo.get(radio, "checked")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["checked"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(radio, "style.display")).toEqual({
    type:NodePropertyType.level2nd,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(radio, "radio")).toEqual({
    type:NodePropertyType.radio,
    nodePropertyElements:["radio"],
    eventType:undefined,
  });

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  expect(NodePropertyInfo.get(checkbox, "checked")).toEqual({
    type:NodePropertyType.levelTop,
    nodePropertyElements:["checked"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(checkbox, "style.display")).toEqual({
    type:NodePropertyType.level2nd,
    nodePropertyElements:["style", "display"],
    eventType:undefined,
  });
  expect(NodePropertyInfo.get(checkbox, "checkbox")).toEqual({
    type:NodePropertyType.checkbox,
    nodePropertyElements:["checkbox"],
    eventType:undefined,
  });

});
