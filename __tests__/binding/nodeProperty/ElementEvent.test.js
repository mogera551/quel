import { ElementEvent } from "../../../src/binding/nodeProperty/ElementEvent.js";

let calledEventHandler = false;
const binding = {
  eventHandler: () => {
    calledEventHandler = true;
  }
}

test("ElementEvent", () => {
  const element = document.createElement("div");
  const elementEvent = new ElementEvent(binding, element, "onclick", [], {});
  expect(elementEvent.binding).toBe(binding);
  expect(elementEvent.node).toBe(element);
  expect(elementEvent.element).toBe(element);
  expect(elementEvent.name).toBe("onclick");
  expect(elementEvent.nameElements).toEqual(["onclick"]);
  expect(elementEvent.filters).toEqual([]);
  expect(elementEvent.filterFuncs).toEqual({});
  expect(elementEvent.eventType).toBe("click");
  expect(elementEvent.applicable).toBe(false);
  expect(elementEvent.expandable).toBe(false);

  elementEvent.initialize();

  calledEventHandler = false;
  element.dispatchEvent(new Event('click'));
  expect(calledEventHandler).toBe(true);

})

test("ElementEvent fail", () => {
  expect(() => {
    const element = document.createElement("div");
    const elementEvent = new ElementEvent(binding, element, "Onclick", [], {});
  }).toThrow("invalid property name Onclick")
  expect(() => {
    const element = document.createElement("div");
    const elementEvent = new ElementEvent(binding, element, "click", [], {});
  }).toThrow("invalid property name click")
  expect(() => {
    const element = document.createElement("div");
    const elementEvent = new ElementEvent(binding, element, "", [], {});
  }).toThrow("invalid property name ")
});
