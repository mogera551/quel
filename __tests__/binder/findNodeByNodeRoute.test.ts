import "jest";
import { findNodeByNodeRoute } from "../../src/binder/findNodeByNodeRoute";

describe("nodeRoute", () => {
  it("findNodeByNodeRoute", () => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    const p = document.createElement("p");
    div.appendChild(span);
    div.appendChild(p);
    expect(findNodeByNodeRoute(div, [0])).toBe(span);
    expect(findNodeByNodeRoute(div, [1])).toBe(p);
    expect(findNodeByNodeRoute(div, [2])).toBeUndefined();
  });
});