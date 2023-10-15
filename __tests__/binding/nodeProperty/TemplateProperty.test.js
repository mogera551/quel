import { TemplateProperty } from "../../../src/binding/nodePoperty/TemplateProperty.js";
import { inputFilters } from "../../../src/filter/Builtin.js";
import { Templates } from "../../../src/view/Templates.js";

const uuid = "123-123";
const template = document.createElement("template");
Templates.templateByUUID.set("123-123", template);
test("TemplateProperty property access", () => {
  {
    const node = document.createComment("@@|123-123");
    const templateProperty = new TemplateProperty(node, "if", [], {});
    expect(templateProperty.uuid).toBe("123-123");
    expect(templateProperty.template).toBe(template);
    expect(templateProperty.applicable).toBe(true);
  }
  {
    const node = document.createComment("@@|123-124");
    const templateProperty = new TemplateProperty(node, "if", [], {});
    expect(templateProperty.uuid).toBe("123-124");
    expect(templateProperty.template).toBe(undefined);
  }

});