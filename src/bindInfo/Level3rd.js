import BindInfo from "./BindInfo.js";
import Filter from "../filter/Filter.js";
import { SYM_CALL_DIRECT_GET, SYM_CALL_DIRECT_SET } from "../viewModel/Symbols.js";
import { NodeUpdateData } from "../thread/NodeUpdator.js";

export default class Level3rd extends BindInfo {
  get nodeProperty1() {
    return this.nodePropertyElements[0];
  }
  get nodeProperty2() {
    return this.nodePropertyElements[1];
  }
  get nodeProperty3() {
    return this.nodePropertyElements[2];
  }
  updateNode() {
    const {component, node, nodeProperty, viewModel, viewModelProperty, indexes, contextIndexes, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForOutput(viewModel[SYM_CALL_DIRECT_GET](viewModelProperty, indexes, contextIndexes), filters);
    if (this.lastViewModelValue !== value) {
      component.updateSlot.addNodeUpdate(new NodeUpdateData(node, nodeProperty, viewModelProperty, value, () => {
        node[nodeProperty1][nodeProperty2][nodeProperty3] = value ?? "";
      }));
      this.lastViewModelValue = value;
    }
  }

  updateViewModel() {
    const {node, nodeProperty, viewModel, viewModelProperty, indexes, filters} = this;
    const { nodeProperty1, nodeProperty2, nodeProperty3 } = this;
    const value = Filter.applyForInput(node[nodeProperty1][nodeProperty2][nodeProperty3], filters);
    viewModel[SYM_CALL_DIRECT_SET](viewModelProperty, indexes, value);
    this.lastViewModelValue = value;
  }

}