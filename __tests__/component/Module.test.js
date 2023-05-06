import { Module } from "../../src/component/Module.js";

test("Module replaceTag", () => {
  const html = `
<div></div>
  `;
  expect(Module.replaceTag(html)).toBe(`
<div></div>
  `);
});

test("Module replaceTag", () => {
  const html = `
<div>{{aaa}}</div>
  `;
  expect(Module.replaceTag(html)).toBe(`
<div><!--@@aaa--></div>
  `);
});

test("Module replaceTag", () => {
  const html = `
{{loop:aaa}}
<div>{{aaa.*}}</div>
{{end:}}
  `;
  expect(Module.replaceTag(html)).toBe(`
<template data-bind="loop:aaa">
<div><!--@@aaa.*--></div>
</template>
  `);
});

test("Module replaceTag", () => {
  const html = `
{{loop:aaa}}
  {{loop:aaa.*}}
<div>{{aaa.*.*}}</div>
  {{end:}}
{{end:}}
  `;
  expect(Module.replaceTag(html)).toBe(`
<template data-bind="loop:aaa">
  <template data-bind="loop:aaa.*">
<div><!--@@aaa.*.*--></div>
  </template>
</template>
  `);
});

test("Module replaceTag", () => {
  const html = `
{{if:aaa}}
<div>OK</div>
{{end:}}
  `;
  expect(Module.replaceTag(html)).toBe(`
<template data-bind="if:aaa">
<div>OK</div>
</template>
  `);
});

test("Module replaceTag", () => {
  const html = `
{{if:aaa}}
<div>OK</div>
{{else:}}
<div>NG</div>
{{end:}}
  `;
  expect(Module.replaceTag(html)).toBe(`
<template data-bind="if:aaa">
<div>OK</div>
</template><template data-bind="if:aaa|not">
<div>NG</div>
</template>
  `);
});

test("Module htmlToTemplate", () => {
  const template = Module.htmlToTemplate(null, null);
  expect(template instanceof HTMLTemplateElement).toBe(true);
  expect(template.innerHTML).toBe(``);
});

test("Module htmlToTemplate", () => {
  const html = `
{{loop:aaa}}
  {{loop:aaa.*}}
<div>{{aaa.*.*}}</div>
  {{end:}}
{{end:}}
  `;
  const template = Module.htmlToTemplate(html, null);
  expect(template instanceof HTMLTemplateElement).toBe(true);
  expect(template.innerHTML).toBe(`
<template data-bind="loop:aaa">
  <template data-bind="loop:aaa.*">
<div><!--@@aaa.*.*--></div>
  </template>
</template>
  `);
});

test("Module htmlToTemplate", () => {
  const css = `
div {
  color: red;
}
  `;
  const html = `
{{loop:aaa}}
  {{loop:aaa.*}}
<div>{{aaa.*.*}}</div>
  {{end:}}
{{end:}}
  `;
  const template = Module.htmlToTemplate(html, css);
  expect(template instanceof HTMLTemplateElement).toBe(true);
  expect(template.innerHTML).toBe(`<style>

div {
  color: red;
}
  
</style>
<template data-bind="loop:aaa">
  <template data-bind="loop:aaa.*">
<div><!--@@aaa.*.*--></div>
  </template>
</template>
  `);
});

test("Module ", () => {
  const module = new Module
  module.css = `
div {
  color: red;
}
  `;
  module.html = `
{{loop:aaa}}
  {{loop:aaa.*}}
<div>{{aaa.*.*}}</div>
  {{end:}}
{{end:}}
  `;
  expect(module.template instanceof HTMLTemplateElement).toBe(true);
  expect(module.template.innerHTML).toBe(`<style>

div {
  color: red;
}
  
</style>
<template data-bind="loop:aaa">
  <template data-bind="loop:aaa.*">
<div><!--@@aaa.*.*--></div>
  </template>
</template>
  `);
});

