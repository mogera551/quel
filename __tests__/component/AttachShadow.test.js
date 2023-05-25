import { AttachShadow } from "../../src/component/AttachShadow.js";

test("AttachShadow isCustomTag", () => {
  expect(AttachShadow.isCustomTag("custom-tag")).toBe(true);
  expect(AttachShadow.isCustomTag("customtag")).toBe(false);
  expect(AttachShadow.isCustomTag("custom-tag-tag")).toBe(true);
});

test("AttachShadow isCustomTag", () => {
  expect(AttachShadow.isAttachable("custom-tag")).toBe(true);
  expect(AttachShadow.isAttachable("customtag")).toBe(false);
  expect(AttachShadow.isAttachable("custom-tag-tag")).toBe(true);

  expect(AttachShadow.isAttachable("articles")).toBe(true);
  expect(AttachShadow.isAttachable("aside")).toBe(true);
  expect(AttachShadow.isAttachable("blockquote")).toBe(true);
  expect(AttachShadow.isAttachable("body")).toBe(true);
  expect(AttachShadow.isAttachable("div")).toBe(true);
  expect(AttachShadow.isAttachable("footer")).toBe(true);
  expect(AttachShadow.isAttachable("h1")).toBe(true);
  expect(AttachShadow.isAttachable("h2")).toBe(true);
  expect(AttachShadow.isAttachable("h3")).toBe(true);
  expect(AttachShadow.isAttachable("h4")).toBe(true);
  expect(AttachShadow.isAttachable("h5")).toBe(true);
  expect(AttachShadow.isAttachable("h6")).toBe(true);
  expect(AttachShadow.isAttachable("header")).toBe(true);
  expect(AttachShadow.isAttachable("main")).toBe(true);
  expect(AttachShadow.isAttachable("nav")).toBe(true);
  expect(AttachShadow.isAttachable("p")).toBe(true);
  expect(AttachShadow.isAttachable("section")).toBe(true);
  expect(AttachShadow.isAttachable("span")).toBe(true);

  expect(AttachShadow.isAttachable("a")).toBe(false);
  expect(AttachShadow.isAttachable("ul")).toBe(false);
  expect(AttachShadow.isAttachable("ol")).toBe(false);
  expect(AttachShadow.isAttachable("li")).toBe(false);
  expect(AttachShadow.isAttachable("input")).toBe(false);
  expect(AttachShadow.isAttachable("button")).toBe(false);
  expect(AttachShadow.isAttachable("select")).toBe(false);
  expect(AttachShadow.isAttachable("textarea")).toBe(false);
  expect(AttachShadow.isAttachable("option")).toBe(false);
  expect(AttachShadow.isAttachable("table")).toBe(false);
  expect(AttachShadow.isAttachable("thead")).toBe(false);
  expect(AttachShadow.isAttachable("tbody")).toBe(false);
  expect(AttachShadow.isAttachable("tfoot")).toBe(false);
  expect(AttachShadow.isAttachable("tr")).toBe(false);
  expect(AttachShadow.isAttachable("td")).toBe(false);
  expect(AttachShadow.isAttachable("caption")).toBe(false);
  expect(AttachShadow.isAttachable("colgroup")).toBe(false);
  expect(AttachShadow.isAttachable("col")).toBe(false);
});
