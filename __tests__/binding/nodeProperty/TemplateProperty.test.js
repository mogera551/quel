import { TemplateProperty } from "../../../src/binding/nodePoperty/TemplateProperty.js";
import { inputFilters } from "../../../src/filter/Builtin.js";
import { Templates } from "../../../src/view/Templates.js";

const uuid = "123-123";
const template = document.createElement("template");
Templates.templateByUUID.set("123-123", template);

const binding = {};

test("TemplateProperty property access", () => {
  {
    const node = document.createComment("@@|123-123");
    const templateProperty = new TemplateProperty(binding, node, "if", [], {});
    expect(templateProperty.binding).toBe(binding);
    expect(templateProperty.node).toBe(node);
    expect(templateProperty.name).toBe("if");
    expect(templateProperty.nameElements).toEqual(["if"]);
    expect(templateProperty.filters).toEqual([]);
    expect(templateProperty.filterFuncs).toEqual({});
    expect(templateProperty.uuid).toBe("123-123");
    expect(templateProperty.template).toBe(template);
  }
  {
    const node = document.createComment("@@|123-124");
    const templateProperty = new TemplateProperty(binding, node, "if", [], {});
    expect(templateProperty.binding).toBe(binding);
    expect(templateProperty.node).toBe(node);
    expect(templateProperty.name).toBe("if");
    expect(templateProperty.nameElements).toEqual(["if"]);
    expect(templateProperty.filters).toEqual([]);
    expect(templateProperty.filterFuncs).toEqual({});
    expect(templateProperty.uuid).toBe("123-124");
    expect(templateProperty.template).toBe(undefined);
  }

});