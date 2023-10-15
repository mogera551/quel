import { ElementEvent } from "../../../src/binding/nodePoperty/ElementEvent.js";

test("ElementEvent", () => {
  const element = document.createElement("div");
  const elementEvent = new ElementEvent(element, "onclick", [], {});
  expect(elementEvent.eventType).toBe("click");
  expect(elementEvent.applicable).toBe(false);

  
})