import "jest";
import { computeNodeRoute } from "../../src/binder/computeNodeRoute";

describe("nodeRoute", () => {
  it("computeNodeRoute", () => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const p = document.createElement("p");
    div.appendChild(span);
    div.appendChild(p);
    expect(computeNodeRoute(span)).toEqual([0]);
    expect(computeNodeRoute(p)).toEqual([1]);
  });
  it("computeNodeRoute multiple class", () => {
    const div = document.createElement("div");
    const div2 = document.createElement("div");
    const span = document.createElement("span");
    const p = document.createElement("p");
    div.appendChild(div2);
    div2.appendChild(span);
    div2.appendChild(p);
    expect(computeNodeRoute(span)).toEqual([0,0]);
    expect(computeNodeRoute(p)).toEqual([0,1]);
  });
});