import { UpdateSlotStatus } from "../../src/thread/UpdateSLotStatus.js";
import { ProcessData, ViewModelUpdator } from "../../src/thread/ViewModelUpdator.js";

test("ViewModelUpdator", async () => {
  const updator = new ViewModelUpdator;
  let calledTest = [];
  class Target {
    test(value) {
      calledTest.push(value);
    }
    test2(value) {
      updator.queue.push(new ProcessData(this.test, this, [value]));
    }
  }
  const target = new Target;
  const proc = new ProcessData(target.test, target, [100]);
  expect(updator.isEmpty).toEqual(true);
  updator.queue.push(proc);
  expect(updator.isEmpty).toEqual(false);

  calledTest = [];
  await updator.exec();
  expect(calledTest).toEqual([100]);

  calledTest = [];
  updator.queue.push(...[
    new ProcessData(target.test, target, [100]),
    new ProcessData(target.test, target, [200]),
  ]);
  await updator.exec();
  expect(calledTest).toEqual([100, 200]);

  calledTest = [];
  updator.queue.push(...[
    new ProcessData(target.test, target, [100]),
    new ProcessData(target.test, target, [200]),
    new ProcessData(target.test2, target, [300]),
  ]);
  await updator.exec();
  expect(calledTest).toEqual([100, 200, 300]);
  
});

test("ViewModelUpdator callback", async () => {
  let calledTest = [];
  const updator = new ViewModelUpdator(status => {
    calledTest.push(status);
  });
  class Target {
    test(value) {
    }
  }
  const target = new Target;

  calledTest = [];
  updator.queue.push(...[
    new ProcessData(target.test, target, [100]),
    new ProcessData(target.test, target, [200]),
  ]);
  await updator.exec();
  expect(calledTest).toEqual([
    UpdateSlotStatus.beginViewModelUpdate,
    UpdateSlotStatus.endViewMmodelUpdate 
  ]);
});
