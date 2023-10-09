import { Radio } from "../../../src/binding/nodePoperty/Radio.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

test("Radio", () => {
  const element = document.createElement("input");
  element.type = "radio";
  const radio = new Radio(element, "", [], {});

  element.value = "100";
  element.checked = false;
  expect(radio.value).toEqual({value:"100", enabled:false});
  expect(radio.filteredValue).toEqual({value:"100", enabled:false});

  radio.value = "100";
  expect(element.checked).toBe(true);

  radio.value = "200";
  expect(element.checked).toBe(false);

});

test("Radio filtered", () => {
  const element = document.createElement("input");
  element.type = "radio";
  const radio = new Radio(element, "", [{name:"number", option:[]}], inputFilters);

  element.value = "100";
  element.checked = false;
  expect(radio.value).toEqual({value:"100", enabled:false});
  expect(radio.filteredValue).toEqual({value:100, enabled:false});

  radio.value = 100;
  expect(element.checked).toBe(true);

  radio.value = 200;
  expect(element.checked).toBe(false);

  radio.value = ["100"];
  expect(element.checked).toBe(false);
});

test("Radio fail", () => {
  expect(() => {
    const element = document.createElement("div");
    const radio = new Radio(element, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const node = document.createTextNode("div");
    const radio = new Radio(node, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const element = document.createElement("input");
    element.type = "checkbox";
    const radio = new Radio(element, "", [], {});
  }).toThrow("not radio");
})