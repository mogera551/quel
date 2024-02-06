import { BindingManager } from "../../../src/binding/Binding.js";
import { Branch } from "../../../src/binding/nodeProperty/Branch.js";
import { utils } from "../../../src/utils.js";
import { Templates } from "../../../src/view/Templates.js";

describe("Branch", () => {
  let branch;
  let uuid = utils.createUUID();
  let template1, template2;

  beforeEach(() => {
    Templates.templateByUUID.clear();
    template1 = document.createElement("template");
    Templates.templateByUUID.set(uuid, template1);
    Templates.templateByUUID.set(utils.createUUID(), template2);
    // Create a new instance of TemplateProperty before each test
    const node = document.createComment(`@@|${uuid}`);
    const name = "if"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    const binding = {
      children: [],
      appendChild: () => {},
    }; // Mock binding object
    branch = new Branch(binding, node, name, filters, inputFilterFuncs);
  });

  it("should have a default value", () => {
    expect(branch.value).toBe(false);
  });

  it("should set the value correctly", () => {
    const binding_appendChild = jest.spyOn(binding, "appendChild").mockImplementation((bindingManager) => {});
    const newValue = true;
    branch.value = newValue;
    expect(branch.value).toBe(newValue);
    expect(binding_appendChild.mock.calls.length).toBe(1);
    //expect(binding_appendChild.mock.calls[0]).toEqual([elementEvent.eventType, elementEvent.handler]);
  });

  it("should same check always returned false", () => {
    expect(branch.isSameValue(true)).toBe(false);
    expect(branch.isSameValue(false)).toBe(false);
  });

  // Add more test cases as needed
});
