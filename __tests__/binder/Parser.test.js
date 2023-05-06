import { Parser, BindTextInfo } from "../../src/binder/Parser.js";
import { Filter } from "../../src/filter/Filter.js";

test("Parser", () => {
  expect(Parser.parse("aaa", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"textContent", viewModelProperty:"aaa", filters:[] }),
  ]);
  expect(Parser.parse("textContent:aaa", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"textContent", viewModelProperty:"aaa", filters:[] }),
  ]);
  expect(Parser.parse("textContent:aaa", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"textContent", viewModelProperty:"aaa", filters:[] }),
  ]);
  expect(Parser.parse("value:aaa", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"value", viewModelProperty:"aaa", filters:[] }),
  ]);
  expect(Parser.parse("value:aaa; disabled:bbb", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"value", viewModelProperty:"aaa", filters:[] }),
    Object.assign(new BindTextInfo, { nodeProperty:"disabled", viewModelProperty:"bbb", filters:[] }),
  ]);
  expect(Parser.parse("value:aaa|falsey; disabled:bbb|localeString", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"value", viewModelProperty:"aaa", filters:[
      Object.assign(new Filter, { name:"falsey", options:[] }),
    ] }),
    Object.assign(new BindTextInfo, { nodeProperty:"disabled", viewModelProperty:"bbb", filters:[
      Object.assign(new Filter, { name:"localeString", options:[] }),
    ] }),
  ]);
  expect(Parser.parse("value:aaa|fixed,2", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"value", viewModelProperty:"aaa", filters:[
      Object.assign(new Filter, { name:"fixed", options:['2'] }),
    ] }),
  ]);
  expect(Parser.parse("value:@|fixed,2", "textContent")).toEqual([
    Object.assign(new BindTextInfo, { nodeProperty:"value", viewModelProperty:"value", filters:[
      Object.assign(new Filter, { name:"fixed", options:['2'] }),
    ] }),
  ]);

});