import { NotifyReceiver } from "../../src/thread/NotifyReceiver.js";
import { Component } from "../../src/component/Component.js";
import { createViewModel } from "../../src/viewModel/Proxy.js";
import { dotNotation } from "../../modules/imports.js";
import { UpdateSlotStatus } from "../../src/thread/UpdateSLotStatus.js";

customElements.define("custom-tag", Component);
const component = document.createElement("custom-tag");
class ViewModel {
  "aaa" = 100;
  "bbb" = [ 1,2,3 ];

}
component.viewModel = createViewModel(component, ViewModel);
let calledApplyToNode = [];
component.applyToNode = (setOfViewModelPropertyKeys) => {
  calledApplyToNode.push(setOfViewModelPropertyKeys);
};

const tmp = component.viewModel["bbb.0"];

test("NotifyReceiver", async () => {
  const receiver = new NotifyReceiver(component);
  expect(receiver.isEmpty).toBe(true);
  receiver.queue.push(...[
    { propName:dotNotation.PropertyName.create("aaa"), indexes:[] },
    { propName:dotNotation.PropertyName.create("bbb.*"), indexes:[1] },
  ]);
  expect(receiver.isEmpty).toBe(false);

  calledApplyToNode = [];
  await receiver.exec();
  expect(calledApplyToNode).toEqual([
    new Set(["aaa\t", "bbb.*\t1"]),
  ]);
  expect(receiver.isEmpty).toBe(true);

  calledApplyToNode = [];
  receiver.queue.push(...[
    { propName:dotNotation.PropertyName.create("bbb"), indexes:[] },
  ]);
  await receiver.exec();
  expect(calledApplyToNode).toEqual([
    new Set(["bbb\t", "bbb.*\t0", "bbb.*\t1", "bbb.*\t2"]),
  ]);

});

test("NotifyReceiver callback", async () => {
  let calledTest = [];
  const receiver = new NotifyReceiver(component, status => {
    calledTest.push(status);
  });

  calledTest = [];
  calledApplyToNode = [];
  receiver.queue.push(...[
    { propName:dotNotation.PropertyName.create("aaa"), indexes:[] },
    { propName:dotNotation.PropertyName.create("bbb"), indexes:[] },
  ]);
  await receiver.exec();
  expect(calledTest).toEqual([
    UpdateSlotStatus.beginNotifyReceive,
    UpdateSlotStatus.endNotifyReceive,
  ]);
});
