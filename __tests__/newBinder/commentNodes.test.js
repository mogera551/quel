
import {expect, jest, test} from '@jest/globals';
import { getCommentNodes } from "../../src/newBinder/commentNodes.js";

describe("getCommentNodes", () => {
  
  it("should return comment nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
        <div>
          <!--@@:content-->
        </div>
        <!--@@:content-->
        <!--@@:content-->
        <div>
          <!--@@:content-->
        </div>
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(4);
    expect(nodes[0].textContent).toBe("@@:content");
    expect(nodes[1].textContent).toBe("@@:content");
    expect(nodes[2].textContent).toBe("@@:content");
    expect(nodes[3].textContent).toBe("@@:content");
  });
  it("should return comment nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
        <div>
          <!--@@|UUID-->
        </div>
        <!--@@|UUID-->
        <!--@@|UUID-->
        <div>
          <!--@@|UUID-->
        </div>
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(4);
    expect(nodes[0].textContent).toBe("@@|UUID");
    expect(nodes[1].textContent).toBe("@@|UUID");
    expect(nodes[2].textContent).toBe("@@|UUID");
    expect(nodes[3].textContent).toBe("@@|UUID");
  });
  it("should return comment nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
        <div>
          <!--@@:content-->
        </div>
        <!--@@|UUID-->
        <!--@@:content-->
        <div>
          <!--@@|UUID-->
        </div>
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(4);
    expect(nodes[0].textContent).toBe("@@:content");
    expect(nodes[1].textContent).toBe("@@|UUID");
    expect(nodes[2].textContent).toBe("@@:content");
    expect(nodes[3].textContent).toBe("@@|UUID");
  });
  it("should return comment nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
        <div>
          <!--@@:content-->
        </div>
        <!--@@|UUID-->
        <!--@@:content-->
        <div>
          <!--@@|UUID-->
        </div>
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(4);
    expect(nodes[0].textContent).toBe("@@:content");
    expect(nodes[1].textContent).toBe("@@|UUID");
    expect(nodes[2].textContent).toBe("@@:content");
    expect(nodes[3].textContent).toBe("@@|UUID");
  });
  it("should return comment no nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
        <!--@@@:content-->
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(0);
  });
  it("should return comment no nodes", () => {
    const template = document.createElement("template");
    template.innerHTML = `
      <div>
      </div>
    `;
    const nodes = getCommentNodes(template.content);
    expect(nodes.length).toBe(0);
  });
});
