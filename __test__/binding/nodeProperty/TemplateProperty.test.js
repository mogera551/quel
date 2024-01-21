import { TemplateProperty } from "../../../src/binding/nodeProperty/TemplateProperty.js";
import { utils } from "../../../src/utils.js";
import { Templates } from "../../../src/view/Templates.js";

describe("TemplateProperty", () => {
  let templateProperty;
  let template1, template2;
  let binding;
  let uuid = utils.createUUID();

  beforeEach(() => {
    Templates.templateByUUID.clear();
    binding = {
    }; // Mock binding object
    template1 = document.createElement("template");
    Templates.templateByUUID.set(uuid, template1);
    Templates.templateByUUID.set(utils.createUUID(), template2);
    // Create a new instance of TemplateProperty before each test
    const commentNode = document.createComment(`@@|${uuid}`);
    const name = "if:node"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    templateProperty = new TemplateProperty(binding, commentNode, name, filters, inputFilterFuncs);
  });

  it("should have a template property", () => {
    // Test the getter for the template property
    expect(templateProperty.template).toBe(template1);
  });

  it("should have a uuid property", () => {
    // Test the getter for the uuid property
    expect(templateProperty.uuid).toBe(uuid);
  });

  it("should have a static getUUID method", () => {
    // Test the static getUUID method
    const uuid = utils.createUUID();
    const commentNode = document.createComment(`@@|${uuid}`);
    expect(TemplateProperty.getUUID(commentNode)).toBe(uuid);
  });

  it("should have an expandable property", () => {
    // Test the getter for the expandable property
    expect(templateProperty.expandable).toBe(true);
  });

  test ("invalid node", () => {
    const binding = {}; // Mock binding object
    const node = {}; // Mock element node
    const name = "if:node"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object

    expect(() => {
      new TemplateProperty(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("TemplateProperty: not Comment");
  });

  test("invalid uuid", () => {
    const binding = {}; // Mock binding object
    const node = document.createComment("@@|xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"); // Mock element node
    const name = "if:node"; // Mock property name
    const filters = []; // Mock filters array
    const inputFilterFuncs = {}; // Mock input filter functions object
    console.log(TemplateProperty.getUUID(node));

    expect(() => {
      new TemplateProperty(binding, node, name, filters, inputFilterFuncs);
    }).toThrow("TemplateProperty: invalid uuid xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
  });

});
