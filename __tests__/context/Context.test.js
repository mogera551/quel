import { PropertyName } from "../../modules/dot-notation/dot-notation";
import { Context } from "../../src/context/Context.js";

test("Context create", () => {
  expect(Context.create()).toEqual({ indexes:[], stack:[] });
});

test("Context clone", () => {
  const context = Context.create();
  context.indexes.push(...[0,1]);
  context.stack.push({ indexes:[0], pos:0, propName:PropertyName.create("aaa") });
  context.stack.push({ indexes:[0,1], pos:1, propName:PropertyName.create("aaa.*") });
  expect(Context.clone(context)).toEqual({ 
    indexes:[0,1], 
    stack:[
      { indexes:[0], pos:0, propName:PropertyName.create("aaa") },
      { indexes:[0,1], pos:1, propName:PropertyName.create("aaa.*") },
    ] });
});
