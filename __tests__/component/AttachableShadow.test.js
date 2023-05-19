import { AttachableShadow } from "../../src/component/AttachableShadow.js";

test("AttachableShadow isCustomTag", () => {
  expect(AttachableShadow.isCustomTag("custom-tag")).toBe(true);
  expect(AttachableShadow.isCustomTag("customtag")).toBe(false);
  expect(AttachableShadow.isCustomTag("custom-tag-tag")).toBe(true);
});

test("AttachableShadow isCustomTag", () => {
  expect(AttachableShadow.isAttachableShadow("custom-tag")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("customtag")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("custom-tag-tag")).toBe(true);

  expect(AttachableShadow.isAttachableShadow("articles")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("aside")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("blockquote")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("body")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("div")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("footer")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h1")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h2")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h3")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h4")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h5")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("h6")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("header")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("main")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("nav")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("p")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("section")).toBe(true);
  expect(AttachableShadow.isAttachableShadow("span")).toBe(true);

  expect(AttachableShadow.isAttachableShadow("a")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("ul")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("ol")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("li")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("input")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("button")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("select")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("textarea")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("option")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("table")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("thead")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("tbody")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("tfoot")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("tr")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("td")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("caption")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("colgroup")).toBe(false);
  expect(AttachableShadow.isAttachableShadow("col")).toBe(false);
});
