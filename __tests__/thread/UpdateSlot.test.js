import { dotNotation } from "../../modules/imports";
import { Component } from "../../src/component/Component";
import { createViewModel } from "../../src/newViewModel/Proxy.js";
import { NodeUpdateData, NodeUpdator } from "../../src/thread/NodeUpdator";
import { NotifyReceiver } from "../../src/thread/NotifyReceiver.js";
import { UpdateSlot } from "../../src/thread/UpdateSlot.js";
import { ProcessData, ViewModelUpdator } from "../../src/thread/ViewModelUpdator";

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

test("UpdateSlot", async () => {
  const slot = new UpdateSlot(component);
  expect(slot.viewModelUpdator instanceof ViewModelUpdator).toBe(true);
  expect(slot.notifyReceiver instanceof NotifyReceiver).toBe(true);
  expect(slot.nodeUpdator instanceof NodeUpdator).toBe(true);
  await slot.exec();
});

test("UpdateSlot waiting", async () => {
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.waitResolve(true);
  }, 100);
  const result = await slot.waiting();
  expect(waiting).toBe(false);
  expect(result).toBe(true);

  slot.waitResolve();
  slot.waitReject();
  await slot.exec();
});

test("UpdateSlot waiting reject", async () => {
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.waitReject();
  }, 100);
  let thrown = -1;
  try {
    const result = await slot.waiting();
  } catch(e) {
    thrown = e;
  }
  expect(waiting).toBe(false);
  expect(thrown).toBe(undefined);
});

test("UpdateSlot waiting queue viewModelUpdate", async () => {
  class Target {
    exec() {

    }
  }
  const target = new Target;
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addProcess(new ProcessData(target.exec, target, []));
    slot.addProcess(new ProcessData(target.exec, target, []));
  }, 100);
  const result = await slot.waiting();
  expect(waiting).toBe(false);
  expect(result).toBe(true);
  expect(slot.viewModelUpdator.queue.length).toBe(2);
});

test("UpdateSlot waiting queue notifyReceive", async () => {
  class Target {
    exec() {

    }
  }
  const target = new Target;
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addNotify({ propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
    slot.addNotify({ propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
    slot.addNotify({ propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
  }, 100);
  const result = await slot.waiting();
  expect(waiting).toBe(false);
  expect(result).toBe(true);
  expect(slot.notifyReceiver.queue.length).toBe(3);
});

test("UpdateSlot waiting queue nodeUpdate", async () => {
  class Target {
    exec() {

    }
  }
  const target = new Target;
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addNodeUpdate(new NodeUpdateData());
    slot.addNodeUpdate(new NodeUpdateData());
    slot.addNodeUpdate(new NodeUpdateData());
    slot.addNodeUpdate(new NodeUpdateData());
  }, 100);
  const result = await slot.waiting();
  expect(waiting).toBe(false);
  expect(result).toBe(true);
  expect(slot.nodeUpdator.queue.length).toBe(4);
});

test("UpdateSlot waiting queue exec viewModelUpdator", async () => {
  const slot = new UpdateSlot(component);
  let calledExec = [];
  class Target {
    exec(value) {
      calledExec.push(value);
    }
    exec2(value) {
      slot.addProcess(new ProcessData(target.exec, target, [value]));
    }
  }
  const target = new Target;
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addProcess(new ProcessData(target.exec, target, [100]));
    slot.addProcess(new ProcessData(target.exec2, target, [200]));
  }, 100);
  await slot.waiting();
  await slot.exec();
  expect(calledExec).toEqual([100, 200]);

});

test("UpdateSlot waiting queue exec notifyReceiver", async () => {
  calledApplyToNode = [];
  const slot = new UpdateSlot(component);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addNotify({ propName:dotNotation.PropertyName.create("aaa"), indexes:[] });
    slot.addNotify({ propName:dotNotation.PropertyName.create("bbb"), indexes:[] });
  }, 100);
  await slot.waiting();
  await slot.exec();
  expect(calledApplyToNode).toEqual([new Set(["aaa\t", "bbb\t"])]);

});

test("UpdateSlot waiting queue exec nodeUpdator", async () => {
  const slot = new UpdateSlot(component);
  let calledExec = [];
  const func = value => () => calledExec.push(value);
  let waiting = true;
  setTimeout(() => {
    waiting = false;
    slot.addNodeUpdate(new NodeUpdateData(
      document.createElement("select"), "value", "val", 1, func(1)
    ));
    slot.addNodeUpdate(new NodeUpdateData(
      document.createElement("option"), "value", "val", 1, func(2)
    ));
  }, 100);
  await slot.waiting();
  setTimeout(async () => {
    await slot.exec();
  }, 10);
  await slot.alive();
  expect(calledExec).toEqual([2,1]);
});

test("UpdateSlot waiting queue callback", async () => {
  let calledExec = [];
  const slot = new UpdateSlot(component, () => {
    calledExec.push(100);
  });
  slot.callback();
  expect(calledExec).toEqual([100]);
});

test("UpdateSlot waiting queue callback", async () => {
  let calledExec = [];
  const slot = new UpdateSlot(component);
  slot.callback();
  expect(calledExec).toEqual([]);
});
