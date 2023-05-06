import { Thread } from "../../src/thread/Thread.js";
import { UpdateSlot } from "../../src/thread/UpdateSlot.js";
import { ProcessData } from "../../src/thread/ViewModelUpdator.js";
import { Main } from "../../src/main.js";

test("Thread", async () => {
  const thread = new Thread;
  const p = new Promise((resolve) => {
    setTimeout(() => {
      thread.stop();
      setTimeout(() => {
        resolve();
      }, 100);
    }, 100);
  
  });
  await p;
  expect(thread.alive).toBe(false);

});

test("Thread", async () => {
  const thread = new Thread;
  const slot = new UpdateSlot;
  let calledExec = [];
  class Target {
    exec(value) {
      calledExec.push(value);
    }
  }
  const target = new Target;
  slot.addProcess(new ProcessData(target.exec, target, [100]));
  slot.addProcess(new ProcessData(target.exec, target, [200]));
  thread.wakeup(slot);
  
  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p;
  expect(thread.alive).toBe(true);
  expect(calledExec).toEqual([100, 200]);
  thread.stop();
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p2;
  expect(thread.alive).toBe(false);

});

class Handler {
  apply(target, thisArg, argumentsList) {
    return () => {};
  }
}
const mockPerformanceMark = new Proxy(() => {}, new Handler);
window.performance = {};
window.performance.mark = mockPerformanceMark;
window.performance.measure = mockPerformanceMark;
window.performance.getEntriesByType = mockPerformanceMark;
window.performance.clearMeasures = mockPerformanceMark;
window.performance.clearMarks = mockPerformanceMark;
window.confirm = () => {};

test("Thread debug", async () => {
  
  Main.config({ debug: true });
  
  const thread = new Thread;
  const slot = new UpdateSlot;
  let calledExec = [];
  class Target {
    exec(value) {
      calledExec.push(value);
    }
  }
  const target = new Target;
  slot.addProcess(new ProcessData(target.exec, target, [100]));
  slot.addProcess(new ProcessData(target.exec, target, [200]));
  thread.wakeup(slot);

  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p;
  expect(Main.debug).toBe(true);
  expect(thread.alive).toBe(true);
  expect(calledExec).toEqual([100, 200]);
  thread.stop();
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p2;
  expect(thread.alive).toBe(false);

});

test("Thread", async () => {
  
  Main.config({ debug: false });
  window.confirm = () => false;
  
  const thread = new Thread;
  const slot = new UpdateSlot;
  let calledExec = [];
  class Target {
    exec(value) {
      throw new Error("error");
    }
  }
  const target = new Target;
  slot.addProcess(new ProcessData(target.exec, target, [100]));
  slot.addProcess(new ProcessData(target.exec, target, [200]));
  thread.wakeup(slot);
  
  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p;
  expect(thread.alive).toBe(false);

});

test("Thread", async () => {
  
  Main.config({ debug: false });
  window.confirm = () => true;
  
  const thread = new Thread;
  const slot = new UpdateSlot;
  let calledExec = [];
  class Target {
    exec(value) {
      throw new Error("error");
    }
  }
  const target = new Target;
  slot.addProcess(new ProcessData(target.exec, target, [100]));
  slot.addProcess(new ProcessData(target.exec, target, [200]));
  thread.wakeup(slot);
  
  const p = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p;
  expect(thread.alive).toBe(true);
  thread.stop();
  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
  await p2;
  expect(thread.alive).toBe(false);

});