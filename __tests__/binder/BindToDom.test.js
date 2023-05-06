import { Component } from "../../src/component/Component.js";
import { BindToDom } from "../../src/binder/BindToDom.js";
import { LevelTop } from "../../src/bindInfo/LevelTop.js";
import { NodePropertyType } from "../../src/node/PropertyType.js";
import { Level2nd } from "../../src/bindInfo/Level2nd.js";
import { Level3rd } from "../../src/bindInfo/Level3rd.js";
import { Checkbox } from "../../src/bindInfo/Checkbox.js";
import { Radio } from "../../src/bindInfo/Radio.js";
import { ClassName } from "../../src/bindInfo/ClassName.js";
import { ComponentBind } from "../../src/bindInfo/Component.js";
import { Event } from "../../src/bindInfo/Event.js";
import { Template } from "../../src/bindInfo/Template.js";
import { Filter } from "../../src/filter/Filter.js";
import { BindInfo } from "../../src/bindInfo/BindInfo.js";

class CustomTag extends HTMLElement {
  aaa = {
    bbb: {
      ccc: 100
    }
  }
}
customElements.define("custom-tag", CustomTag);
customElements.define("my-component", Component);


test("BindToDom parseBindText single levelTop default", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("aaa", "textContent");
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.levelTop,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].viewModelProperty).toBe("aaa");

});

test("BindToDom parseBindText single levelTop default filters", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("aaa|falsey|not|fixed,2", "textContent");
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, 
      viewModel, 
      filters:[
        Object.assign(new Filter, { name:"falsey", options:[] }),
        Object.assign(new Filter, { name:"not", options:[] }),
        Object.assign(new Filter, { name:"fixed", options:["2"] }),
      ], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.levelTop,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].viewModelProperty).toBe("aaa");
});

test("BindToDom parseBindText single LevelTop", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("disabled:bbb;", "textContent");
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.levelTop, 
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("disabled");
  expect(binds[0].nodePropertyElements).toEqual(["disabled"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

test("BindToDom parseBindText multi LevelTop", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("aaa; disabled:bbb;", "textContent");
  expect(binds).toEqual([
    Object.assign(new LevelTop, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.levelTop, 
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    }),
    Object.assign(new LevelTop, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.levelTop, 
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    }),
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("textContent");
  expect(binds[0].nodePropertyElements).toEqual(["textContent"]);
  expect(binds[0].viewModelProperty).toBe("aaa");

  expect(binds[1].node).toBe(node);
  expect(binds[1].nodeProperty).toBe("disabled");
  expect(binds[1].nodePropertyElements).toEqual(["disabled"]);
  expect(binds[1].viewModelProperty).toBe("bbb");
});

test("BindToDom parseBindText single Level2nd", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("style.display:bbb;", "textContent");
  expect(binds).toEqual([
    Object.assign(new Level2nd, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.level2nd, 
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("style.display");
  expect(binds[0].nodePropertyElements).toEqual(["style", "display"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

test("BindToDom parseBindText single Level3rd", () => {
  const node = document.createElement("custom-tag");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("aaa.bbb.ccc:bbb;", "textContent");
  expect(binds).toEqual([
    Object.assign(new Level3rd, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.level3rd,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("aaa.bbb.ccc");
  expect(binds[0].nodePropertyElements).toEqual(["aaa", "bbb", "ccc"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

test("BindToDom parseBindText single Checkbox", () => {
  const node = document.createElement("input");
  node.type = "checkbox";
  node.value = "100";
  const viewModel = {
    "aaa": [],
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("checkbox:aaa;", "checked");
  expect(binds).toEqual([
    Object.assign(new Checkbox, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.checkbox,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("checkbox");
  expect(binds[0].nodePropertyElements).toEqual(["checkbox"]);
  expect(binds[0].viewModelProperty).toBe("aaa");
});

test("BindToDom parseBindText single Radio", () => {
  const node = document.createElement("input");
  node.type = "radio";
  node.value = "100";
  const viewModel = {
    "aaa": undefined,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("radio:aaa;", "checked");
  expect(binds).toEqual([
    Object.assign(new Radio, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.radio,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("radio");
  expect(binds[0].nodePropertyElements).toEqual(["radio"]);
  expect(binds[0].viewModelProperty).toBe("aaa");
});

test("BindToDom parseBindText single ClassName", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": [],
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("className.zzz:aaa;", "textContent");
  expect(binds).toEqual([
    Object.assign(new ClassName, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.className,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("className.zzz");
  expect(binds[0].nodePropertyElements).toEqual(["className", "zzz"]);
  expect(binds[0].viewModelProperty).toBe("aaa");
});

test("BindToDom parseBindText single Component", () => {
  const parentNode = document.createElement("my-component");
  const node = document.createElement("my-component");
  parentNode.appendChild(node);
  parentNode.viewModel = {
    aaa: 100
  };
  const component = parentNode;
  const viewModel = parentNode.viewModel;
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("$props.bbb:aaa;", "textContent");
  expect(binds).toEqual([
    Object.assign(new ComponentBind, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.component,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("$props.bbb");
  expect(binds[0].nodePropertyElements).toEqual(["$props", "bbb"]);
  expect(binds[0].viewModelProperty).toBe("aaa");
});

test("BindToDom parseBindText single Event", () => {
  const node = document.createElement("div");
  const viewModel = {
    "aaa": 100,
    "bbb": true,
    double() {
       this["aaa"] *= 2;

    }
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText("onclick:double;", "textContent");
  expect(binds).toEqual([
    Object.assign(new Event, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:"click", 
      type:NodePropertyType.event,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node).toBe(node);
  expect(binds[0].nodeProperty).toBe("onclick");
  expect(binds[0].nodePropertyElements).toEqual(["onclick"]);
  expect(binds[0].viewModelProperty).toBe("double");
});

test("BindToDom parseBindText single Template if", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  node.dataset.bind = "if:bbb";
  node.innerHTML = `
<div>hoge</div>
  `;
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText(node.dataset.bind, "");
  expect(binds).toEqual([
    Object.assign(new Template, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.template,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("template if:bbb");
  expect(binds[0].nodeProperty).toBe("if");
  expect(binds[0].nodePropertyElements).toEqual(["if"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

test("BindToDom parseBindText single Template loop", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  node.dataset.bind = "loop:bbb";
  node.innerHTML = `
<div>hoge</div>
  `;
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, null, []);
  const binds = parseBindText(node.dataset.bind, "");
  expect(binds).toEqual([
    Object.assign(new Template, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[], 
      indexes:[], 
      eventType:undefined, 
      type:NodePropertyType.template,
      contextBind:null,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("template loop:bbb");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

test("BindToDom applyUpdateNode", () => {
  let calledUpdateNode1 = false;
  let calledUpdateNode2 = false;
  const bind1 = {
    updateNode() {
      calledUpdateNode1 = true;
    }
  };
  const bind2 = {
    updateNode() {
      calledUpdateNode2 = true;
    }
  };
  [bind1, bind2].forEach(BindToDom.applyUpdateNode);
  expect(calledUpdateNode1).toBe(true);
  expect(calledUpdateNode2).toBe(true);

  BindToDom.bind();
});

test("BindToDom indexes", () => {
  const parentNode = document.createElement("div");
  const node = document.createElement("template");
  node.dataset.bind = "loop:bbb";
  node.innerHTML = `
<div>hoge</div>
  `;
  parentNode.appendChild(node);
  const viewModel = {
    "aaa": 100,
    "bbb": true,
  }
  const contextBind = new BindInfo();
  const component = { viewModel };
  const parseBindText = BindToDom.parseBindText(node, component, viewModel, contextBind, [100]);
  const binds = parseBindText(node.dataset.bind, "");
  expect(binds).toEqual([
    Object.assign(new Template, { 
      component, 
      viewModel, 
      filters:[], 
      contextIndexes:[100], 
      indexes:[100], 
      eventType:undefined, 
      type:NodePropertyType.template,
      contextBind:contextBind,
      parentContextBind:null,
      positionContextIndexes:-1,
    })
  ]);
  expect(binds[0].node instanceof Comment).toBe(true);
  expect(binds[0].node.textContent).toBe("template loop:bbb");
  expect(binds[0].nodeProperty).toBe("loop");
  expect(binds[0].nodePropertyElements).toEqual(["loop"]);
  expect(binds[0].viewModelProperty).toBe("bbb");
});

