import { Filter } from "../../src/filter/Filter.js";

test("Filter applyForOutput", () => {
  const filters = [
    Object.assign(new Filter, {name:"le", options:[101]}),
  ];
  expect(Filter.applyForOutput(100, filters)).toBe(true);
});

test("Filter applyForOutput", () => {
  const filters = [
    Object.assign(new Filter, {name:"le", options:[101]}),
    Object.assign(new Filter, {name:"styleDisplay", options:[]}),
  ];
  expect(Filter.applyForOutput(100, filters)).toBe("");
});

test("Filter applyForOutput", () => {
  const filters = [
    Object.assign(new Filter, {name:"le", options:[99]}),
    Object.assign(new Filter, {name:"styleDisplay", options:[]}),
  ];
  expect(Filter.applyForOutput(100, filters)).toBe("none");
});

test("Filter applyForOutput", () => {
  const filters = [
    Object.assign(new Filter, {name:"le", options:[99]}),
    Object.assign(new Filter, {name:"LE", options:[99]}),
    Object.assign(new Filter, {name:"styleDisplay", options:[]}),
  ];
  expect(Filter.applyForOutput(100, filters)).toBe("none");
});

test("Filter applyForOutput", () => {
  const filters = [
  ];
  expect(Filter.applyForOutput(100, filters)).toBe(100);
});

test("Filter applyForOutput", () => {
  const filters = [
    Object.assign(new Filter, {name:"LE", options:[99]}),
  ];
  expect(Filter.applyForOutput(100, filters)).toBe(100);
});

test("Filter applyForInput", () => {
  const filters = [
    Object.assign(new Filter, {name:"number", options:[]}),
  ];
  expect(Filter.applyForInput("101", filters)).toBe(101);
});

test("Filter applyForInput", () => {
  const filters = [
    Object.assign(new Filter, {name:"NUMBER", options:[]}),
  ];
  expect(Filter.applyForInput("101", filters)).toBe("101");
});

test("Filter applyForInput", () => {
  const filters = [
  ];
  expect(Filter.applyForInput("101", filters)).toBe("101");
});

test("Filter regist", () => {
  expect(() => Filter.regist("le", (value, options) => value, (value, options) => value)).toThrow();
  expect(() => Filter.regist("number", (value, options) => value, (value, options) => value)).toThrow();
});

test("Filter regist", () => {
  Filter.regist("double", (value, options) => value == null ? value : (Number(value) * 2), null);
  const filters = [
    Object.assign(new Filter, {name:"double", options:[]}),
  ];
  expect(Filter.applyForOutput("100", filters)).toBe(200);
});

test("Filter regist", () => {
  Filter.regist("double2", null, (value, options) => value == null ? value : (Number(value) * 2),);
  const filters = [
    Object.assign(new Filter, {name:"double2", options:[]}),
  ];
  expect(Filter.applyForInput("100", filters)).toBe(200);
});
