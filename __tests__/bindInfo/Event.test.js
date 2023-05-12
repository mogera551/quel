import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
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
  event.context = {
    indexes:[5, 1, 2],
    stack:[
      {
        propName:PropertyName.create("aaa"),
        indexes:[1],
        pos:1
      }
      ,{
        propName:PropertyName.create("aaa.*"),
        indexes:[1, 2],
        pos:2
      }
      ,{
        propName:PropertyName.create("bbb"),
        indexes:[5],
        pos:0
      }
    ]
  }
  event.addEventListener();
  expect(calledMthod).toBe(undefined);
  button.dispatchEvent(clickEvent);
  expect(calledMthod).toEqual({event:new Event('click'), $1:5, $2:1, $3:2});
  event.context = {
    indexes:[5, 1],
    stack:[
      {
        propName:PropertyName.create("aaa"),
        indexes:[1],
        pos:1
      }
      ,{
        propName:PropertyName.create("bbb"),
        indexes:[5],
        pos:0
      }
    ]
  }
  button.dispatchEvent(clickEvent);
  expect(calledMthod).toEqual({event:new Event('click'), $1:5, $2:1, $3:undefined});


})