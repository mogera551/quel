import { jest } from '@jest/globals';
import { Symbols } from "../../../src/Symbols.js";
import { ElementEvent } from "../../../src/binding/nodeProperty/ElementEvent.js";

describe("ElementEvent", () => {
  /** @type {ElementEvent} */
  let elementEvent;
  let binding;
  let node;

  beforeEach(() => {
    // Create a mock binding, node, name, filters, and filterFuncs for testing
    binding = {
      loopContext: {},
      viewModelProperty: {
        name: "methodName",
        viewModel: {
          [Symbols.directlyCall]: (name, loopContext, event) => {},
        },
      },
      component: {
        updateSlot: {
          addProcess: (processData) => {},
        },
        bindingSummary: {
          allBindings: new Set(),
        }
      }
    }; // Mock binding object
    node = document.createElement("div"); // Mock element node
    const name = "onclick"; // Mock property name
    const filters = []; // Mock filters array
    const filterFuncs = {}; // Mock filter functions object
    elementEvent = new ElementEvent(binding, node, name, filters, filterFuncs);
    binding.component.bindingSummary.allBindings.add(binding);
  });

  it("should have the correct eventType", () => {
    // Test the getter method for eventType
    const eventType = elementEvent.eventType;
    expect(eventType).toBe("click");
  });

  it("should be applicable to the node", () => {
    // Test the getter method for applicable
    const applicable = elementEvent.applicable;
    expect(applicable).toBe(false);
  });

  it("should have the correct handler", () => {
    // Test the getter method for handler
    const handler = elementEvent.handler;
    expect(typeof handler).toBe("function");
    expect(elementEvent.handler).toBe(handler); // cached
  });

  it("should initialize the DOM element with event handlers", () => {
    // Test the initialize method
    const div_addEventListener = jest.spyOn(node, "addEventListener").mockImplementation((event, listener) => {});

    elementEvent.initialize();
    // Assert that the DOM element has been initialized correctly
    expect(div_addEventListener.mock.calls.length).toBe(1);
    expect(div_addEventListener.mock.calls[0]).toEqual([elementEvent.eventType, elementEvent.handler]);
  });

  it("should directly call the event handler", async () => {
    const viewModel_directlyCall = jest.spyOn(binding.viewModelProperty.viewModel, Symbols.directlyCall).mockImplementation((name, loopContext, event) => {});

    // Create a mock event for testing
    const event = {}; // Mock event
    // Test the directlyCall method
    await elementEvent.directlyCall(event);
    // Assert that the event handler has been called correctly
    expect(viewModel_directlyCall.mock.calls.length).toBe(1);
    expect(viewModel_directlyCall.mock.calls[0]).toEqual([binding.viewModelProperty.name, binding.loopContext, event]);
  });

  it("should create process data for the event", () => {
    // Create a mock event for testing
    const event = {};
    // Test the createProcessData method
    const processData = elementEvent.createProcessData(event);
    // Assert that the process data has been created correctly
    expect(processData.target).toBe(elementEvent.directlyCall);
    expect(processData.thisArgument).toBe(elementEvent);
    expect(processData.argumentsList).toEqual([event]);
  });

  it("should handle the event", () => {
    // Create a mock event for testing
    const event = {
      stopPropagation: () => {
      },
    }; // Mock event
    const event_stopPropagation = jest.spyOn(event, "stopPropagation").mockImplementation(() => {});
    const updateSlot_addProcess = jest.spyOn(binding.component.updateSlot, "addProcess").mockImplementation((processData) => {});
    // Test the eventHandler method
    elementEvent.eventHandler(event);
    // Assert that the event has been handled correctly
    expect(event_stopPropagation.mock.calls.length).toBe(1);
    expect(event_stopPropagation.mock.calls[0]).toEqual([]);
    expect(updateSlot_addProcess.mock.calls.length).toBe(1);
    expect(updateSlot_addProcess.mock.calls[0]).toEqual([{
      target: elementEvent.directlyCall,
      thisArgument: elementEvent,
      argumentsList: [event],
    }]);
  });

  test ("should not handle the event if the binding has been removed", () => {
    // Create a mock event for testing
    const event = {
      stopPropagation: () => {
      },
    }; // Mock event
    const event_stopPropagation = jest.spyOn(event, "stopPropagation").mockImplementation(() => {});
    const updateSlot_addProcess = jest.spyOn(binding.component.updateSlot, "addProcess").mockImplementation((processData) => {});
    // Remove the binding from the component's binding summary
    binding.component.bindingSummary.allBindings.delete(binding);
    // Test the eventHandler method
    elementEvent.eventHandler(event);
    // Assert that the event has not been handled
    expect(event_stopPropagation.mock.calls.length).toBe(0);
    expect(updateSlot_addProcess.mock.calls.length).toBe(0);
  });

  test("not event property", () => {
    expect(() => {
      new ElementEvent(binding, node, "notEvent", [], {});
    }).toThrow("ElementEvent: invalid property name notEvent");
  });

  it("should handle the event", () => {
    // Create a mock event for testing
    const event = {
      stopPropagation: () => {
      },
    }; // Mock event
    const event_stopPropagation = jest.spyOn(event, "stopPropagation").mockImplementation(() => {});
    const updateSlot_addProcess = jest.spyOn(binding.component.updateSlot, "addProcess").mockImplementation((processData) => {});
    // Test the eventHandler method
    elementEvent.handler(event);
    // Assert that the event has been handled correctly
    expect(event_stopPropagation.mock.calls.length).toBe(1);
    expect(event_stopPropagation.mock.calls[0]).toEqual([]);
    expect(updateSlot_addProcess.mock.calls.length).toBe(1);
    expect(updateSlot_addProcess.mock.calls[0]).toEqual([{
      target: elementEvent.directlyCall,
      thisArgument: elementEvent,
      argumentsList: [event],
    }]);
  });

});
