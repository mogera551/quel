import {expect, jest, test} from '@jest/globals';

const { findNodeByNodeRoute, computeNodeRoute } = await import("../../src/newBinder/nodeRoute.js");

describe("findNodeByNodeRoute", () => {
  it("should return node", () => {
    const node = document.createElement("div");
    const nodeRoute = computeNodeRoute(node);
    expect(findNodeByNodeRoute(node, nodeRoute)).toBe(node);
  });
  it("should return node", () => {
    const node = document.createElement("div");
    const child = document.createElement("div");
    node.appendChild(child);
    const nodeRoute = computeNodeRoute(child);
    expect(findNodeByNodeRoute(node, nodeRoute)).toBe(child);
  });
  it("should return node", () => {
    const node = document.createElement("div");
    const child = document.createElement("div");
    const child2 = document.createElement("div");
    node.appendChild(child);
    node.appendChild(child2);
    const nodeRoute = computeNodeRoute(child2);
    expect(findNodeByNodeRoute(node, nodeRoute)).toBe(child2);
  });
});
