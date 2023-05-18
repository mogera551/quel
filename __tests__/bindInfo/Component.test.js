import { Component, generateComponentClass } from "../../src/component/Component.js";
import { ComponentBind } from "../../src/bindInfo/Component.js";
import { Symbols } from "../../src/Symbols.js";
import { Handler } from "../../modules/dot-notation/dot-notation.js";

const minimumModule = {html:"", ViewModel:class {}};
customElements.define("custom-tag", generateComponentClass(minimumModule));

test("ComponentBind", () => {
  const parentComponent = document.createElement("custom-tag");
  parentComponent.updateSlot = {
    /**
     * 
     * @param {NodeUpdateData} nodeUpdateData 
     */
    addNodeUpdate(nodeUpdateData) {
      Reflect.apply(nodeUpdateData.updateFunc, nodeUpdateData, []);
    }
  }
  const targetComponent = document.createElement("custom-tag");
  targetComponent.updateSlot = {
    /**
     * 
     * @param {NodeUpdateData} nodeUpdateData 
     */
    addNodeUpdate(nodeUpdateData) {
      Reflect.apply(nodeUpdateData.updateFunc, nodeUpdateData, []);
    }
  }
  parentComponent.appendChild(targetComponent);
  let calledNotifyForDependentProps = undefined;
  class ViewModelHandler extends Handler {
    get(target, prop, receiver) {
      if (prop === Symbols.notifyForDependentProps) {
        return (prop, indexes) => {
          calledNotifyForDependentProps = {prop, indexes};
        }
      }
      return super.get(target, prop, receiver);
    }
  }
  parentComponent.viewModel = new Proxy({ aaa:100 }, new ViewModelHandler(["aaa"]));
  targetComponent.viewModel = new Proxy({}, new ViewModelHandler([]));

  const componentBind = new ComponentBind;
  componentBind.component = parentComponent;
  componentBind.node = targetComponent;
  componentBind.nodeProperty = "$props.bbb";
  componentBind.nodePropertyElements = componentBind.nodeProperty.split(".");
  componentBind.viewModel = parentComponent.viewModel;
  componentBind.viewModelProperty = "aaa";
  componentBind.filters = [];

  expect(targetComponent.parentComponent).toBe(parentComponent);
  expect(targetComponent.props.bbb).toBe(100);
  calledNotifyForDependentProps = undefined;
  componentBind.viewModel.aaa = 200;
  componentBind.updateNode();
  expect(calledNotifyForDependentProps).toEqual({prop:"$props.bbb", indexes:[]});
  expect(targetComponent.props.bbb).toBe(200);

  componentBind.updateViewModel();

  expect(() => componentBind.node = document.createElement("div")).toThrow();
});
