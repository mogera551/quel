import { Event as EventBind } from "../../src/bindInfo/Event.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

test("Event", async () => {
  const button = document.createElement("button");
  const clickEvent = new Event('click');

  const component = {
    updateSlot: {
      addProcess: (proc) => {
        Reflect.apply(proc.target, proc.thisArgument, proc.argumentsList);
      }
    }
  };

  let calledMthod = undefined;
  const viewModel = {
    async [Symbols.directlyCall](prop, indexes, event) {
      return Reflect.apply(this[prop], this, [event, ...indexes])
    },
    method(event, $1, $2, $3) {
      calledMthod = {event, $1, $2, $3};
    }
  };

  const event = new EventBind();
  event.component = component;
  event.node = button;
  event.eventType = "click";
  event.viewModel = viewModel;
  event.viewModelProperty = "method";
  event.contextIndexes = [1,2,3];
  event.addEventListener();
  expect(calledMthod).toBe(undefined);
  button.dispatchEvent(clickEvent);
  expect(calledMthod).toEqual({event:new Event('click'), $1:1, $2:2, $3:3});
  event.contextIndexes = [4,5];
  button.dispatchEvent(clickEvent);
  expect(calledMthod).toEqual({event:new Event('click'), $1:4, $2:5, $3:undefined});


})