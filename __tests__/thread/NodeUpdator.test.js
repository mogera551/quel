import { NodeUpdator, NodeUpdateData } from "../../src/thread/NodeUpdator.js";
import { UpdateSlotStatus } from "../../src/thread/UpdateSLotStatus.js";

test("NodeUpdator", async () => {
  const updator = new NodeUpdator;
  let calledFunc = [];
  const callFunc = (value) => () => calledFunc.push("called" + value);
  
  const data = new NodeUpdateData(
    document.createElement("input"), "value", "val", 1000, callFunc(0)
  );
  expect(updator.isEmpty).toBe(true);
  updator.queue.push(data);
  expect(updator.isEmpty).toBe(false);

  await updator.exec();
  expect(calledFunc).toEqual(["called0"]);

  calledFunc = [];
  updator.queue.push(new NodeUpdateData(
    document.createElement("select"), "disabled", "val", 1000, callFunc(1)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("select"), "value", "val", 1000, callFunc(0)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("option"), "value", "val", 1000, callFunc(2)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("option"), "value", "val", 1000, callFunc(3)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("template"), "value", "val", 1000, callFunc(5)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("option"), "value", "val", 1000, callFunc(4)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("template"), "value", "val", 1000, callFunc(6)
  ));
  await updator.exec();
  expect(calledFunc).toEqual(["called5", "called6", "called1", "called2", "called3", "called4", "called0"]);
});

test("NodeUpdator callback", async () => {
  let calledTest = [];
  const updator = new NodeUpdator((status) => {
    calledTest.push(status);
  });

  const callFunc = (value) => () => {};
  updator.queue.push(new NodeUpdateData(
    document.createElement("select"), "value", "val", 1000, callFunc(0)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("select"), "disabled", "val", 1000, callFunc(1)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("option"), "value", "val", 1000, callFunc(2)
  ));
  updator.queue.push(new NodeUpdateData(
    document.createElement("template"), "value", "val", 1000, callFunc(3)
  ));
  await updator.exec();
  expect(calledTest).toEqual([
    UpdateSlotStatus.beginNodeUpdate,
    UpdateSlotStatus.endNodeUpdate,
  ]);

});

test("NodeUpdator reorder", async () => {
  const updator = new NodeUpdator;
  let queue;
  let orderedQueue;
  queue = [], orderedQueue = [];
  queue.push(new NodeUpdateData(
    document.createElement("select"), "value", "val", 1, ()=>{}
  ));
  queue.push(new NodeUpdateData(
    document.createElement("select"), "disabled", "val", 2, ()=>{}
  ));
  queue.push(new NodeUpdateData(
    document.createElement("select"), "value", "val", 3, ()=>{}
  ));
  orderedQueue = updator.reorder(queue);
  expect(orderedQueue[0].value).toBe(2);
  expect(orderedQueue[1].value).toBe(1);
  expect(orderedQueue[2].value).toBe(3);

  queue = [], orderedQueue = [];
  queue.push(new NodeUpdateData(
    document.createElement("template"), "value", "val", 1, ()=>{}
  ));
  queue.push(new NodeUpdateData(
    document.createElement("select"), "disabled", "val", 2, ()=>{}
  ));
  queue.push(new NodeUpdateData(
    document.createElement("template"), "value", "val", 3, ()=>{}
  ));
  orderedQueue = updator.reorder(queue);
  expect(orderedQueue[0].value).toBe(1);
  expect(orderedQueue[1].value).toBe(3);
  expect(orderedQueue[2].value).toBe(2);
});
