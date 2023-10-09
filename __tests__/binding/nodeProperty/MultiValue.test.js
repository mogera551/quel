import { MultiValue } from "../../../src/binding/nodePoperty/MultiValue.js";

test("MultiValue", () => {
  const multiValue = new MultiValue("123", true);
  expect(multiValue.value).toBe("123");
  expect(multiValue.enabled).toBe(true);
})