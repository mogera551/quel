import { Module } from "../../src/component/Module.js";
import {expect, jest, test} from '@jest/globals';
import { Templates } from "../../src/view/Templates.js";

let uuid_counter = 0;
function fn_randomeUUID() {
  return 'xxxx-xxxx-xxxx-xxxx-' + (uuid_counter++);
}
//Object.defineProperty(window, 'crypto', {
//  value: { randomUUID: jest.fn().mockReturnValue('xxxx-xxxx-xxxx-xxxx') },
//});
Object.defineProperty(window, 'crypto', {
  value: { randomUUID: fn_randomeUUID },
});

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
<div><!--@@:aaa--></div>
  `);
});

test("Module replaceTag", () => {
  const html = `
{{loop:aaa}}
<div>{{aaa.*}}</div>
{{end:}}
  `;
  expect(Module.replaceTag(html)).toBe(`
<!--@@|xxxx-xxxx-xxxx-xxxx-0-->
  `);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-0")).toBe(true);
  const template = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-0");
  expect(template instanceof HTMLTemplateElement).toBe(true);
  expect(template.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-0");
  expect(template.dataset.bind).toBe("loop:aaa");
  expect(template.innerHTML).toBe(`
<div><!--@@:aaa.*--></div>
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
<!--@@|xxxx-xxxx-xxxx-xxxx-1-->
  `);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-1")).toBe(true);
  const template1 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-1");
  expect(template1 instanceof HTMLTemplateElement).toBe(true);
  expect(template1.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-1");
  expect(template1.dataset.bind).toBe("loop:aaa");
  expect(template1.innerHTML).toBe(`
  <!--@@|xxxx-xxxx-xxxx-xxxx-2-->
`);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-2")).toBe(true);
  const template2 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-2");
  expect(template2 instanceof HTMLTemplateElement).toBe(true);
  expect(template2.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-2");
  expect(template2.dataset.bind).toBe("loop:aaa.*");
  expect(template2.innerHTML).toBe(`
<div><!--@@:aaa.*.*--></div>
  `);

});

test("Module replaceTag", () => {
  const html = `
{{if:aaa}}
<div>OK</div>
{{end:}}
  `;

  expect(Module.replaceTag(html)).toBe(`
<!--@@|xxxx-xxxx-xxxx-xxxx-3-->
  `);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-3")).toBe(true);
  const template3 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-3");
  expect(template3 instanceof HTMLTemplateElement).toBe(true);
  expect(template3.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-3");
  expect(template3.dataset.bind).toBe("if:aaa");
  expect(template3.innerHTML).toBe(`
<div>OK</div>
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
<!--@@|xxxx-xxxx-xxxx-xxxx-4--><!--@@|xxxx-xxxx-xxxx-xxxx-5-->
  `);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-4")).toBe(true);
  const template4 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-4");
  expect(template4 instanceof HTMLTemplateElement).toBe(true);
  expect(template4.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-4");
  expect(template4.dataset.bind).toBe("if:aaa");
  expect(template4.innerHTML).toBe(`
<div>OK</div>
`);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-5")).toBe(true);
  const template5 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-5");
  expect(template5 instanceof HTMLTemplateElement).toBe(true);
  expect(template5.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-5");
  expect(template5.dataset.bind).toBe("if:aaa|not");
  expect(template5.innerHTML).toBe(`
<div>NG</div>
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
<!--@@|xxxx-xxxx-xxxx-xxxx-6-->
  `);

  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-6")).toBe(true);
  const template6 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-6");
  expect(template6 instanceof HTMLTemplateElement).toBe(true);
  expect(template6.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-6");
  expect(template6.dataset.bind).toBe("loop:aaa");
  expect(template6.innerHTML).toBe(`
  <!--@@|xxxx-xxxx-xxxx-xxxx-7-->
`);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-7")).toBe(true);
  const template7 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-7");
  expect(template7 instanceof HTMLTemplateElement).toBe(true);
  expect(template7.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-7");
  expect(template7.dataset.bind).toBe("loop:aaa.*");
  expect(template7.innerHTML).toBe(`
<div><!--@@:aaa.*.*--></div>
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
<!--@@|xxxx-xxxx-xxxx-xxxx-8-->
  `);

  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-8")).toBe(true);
  const template8 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-8");
  expect(template8 instanceof HTMLTemplateElement).toBe(true);
  expect(template8.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-8");
  expect(template8.dataset.bind).toBe("loop:aaa");
  expect(template8.innerHTML).toBe(`
  <!--@@|xxxx-xxxx-xxxx-xxxx-9-->
`);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-9")).toBe(true);
  const template9 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-9");
  expect(template9 instanceof HTMLTemplateElement).toBe(true);
  expect(template9.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-9");
  expect(template9.dataset.bind).toBe("loop:aaa.*");
  expect(template9.innerHTML).toBe(`
<div><!--@@:aaa.*.*--></div>
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
<!--@@|xxxx-xxxx-xxxx-xxxx-10-->
  `);

  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-10")).toBe(true);
  const template10 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-10");
  expect(template10 instanceof HTMLTemplateElement).toBe(true);
  expect(template10.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-10");
  expect(template10.dataset.bind).toBe("loop:aaa");
  expect(template10.innerHTML).toBe(`
  <!--@@|xxxx-xxxx-xxxx-xxxx-11-->
`);
  expect(Templates.templateByUUID.has("xxxx-xxxx-xxxx-xxxx-11")).toBe(true);
  const template11 = Templates.templateByUUID.get("xxxx-xxxx-xxxx-xxxx-11");
  expect(template11 instanceof HTMLTemplateElement).toBe(true);
  expect(template11.dataset.uuid).toBe("xxxx-xxxx-xxxx-xxxx-11");
  expect(template11.dataset.bind).toBe("loop:aaa.*");
  expect(template11.innerHTML).toBe(`
<div><!--@@:aaa.*.*--></div>
  `);
});

