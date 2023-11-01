import { Radio } from "../../../src/binding/nodeProperty/Radio.js";
import { inputFilters } from "../../../src/filter/Builtin.js";

const binding = {};

test("Radio", () => {
  const element = document.createElement("input");
  element.type = "radio";
  const radio = new Radio(binding, element, "", [], {});

  element.value = "100";
  element.checked = false;
  expect(radio.value.value).toBe("100");
  expect(radio.value.enabled).toBe(false);
  expect(radio.filteredValue.value).toBe("100");
  expect(radio.filteredValue.enabled).toBe(false);
  expect(radio.applicable).toBe(true);
  expect(radio.expandable).toBe(false);

  radio.value = "100";
  expect(element.checked).toBe(true);

  radio.value = "200";
  expect(element.checked).toBe(false);

});

test("Radio filtered", () => {
  const element = document.createElement("input");
  element.type = "radio";
  const radio = new Radio(binding, element, "", [{name:"number", option:[]}], inputFilters);

  element.value = "100";
  element.checked = false;
  expect(radio.value.value).toBe("100");
  expect(radio.value.enabled).toBe(false);
  expect(radio.filteredValue.value).toBe(100);
  expect(radio.filteredValue.enabled).toBe(false);

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
    const radio = new Radio(binding, element, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const node = document.createTextNode("div");
    const radio = new Radio(binding, node, "", [], {});
  }).toThrow("not htmlInputElement");
  expect(() => {
    const element = document.createElement("input");
    element.type = "checkbox";
    const radio = new Radio(binding, element, "", [], {});
  }).toThrow("not radio");
})