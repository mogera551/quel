import { BindInfo } from "../../src/bindInfo/BindInfo.js";
import { Symbols } from "../../src/newViewModel/Symbols.js";

test('BindInfo', () => {
  const info = new BindInfo();
  const node = document.createTextNode("text");
  info.node = node;
  expect(info.node).toBe(node);
  expect(() => info.element).toThrow();
  const element = document.createElement("div");
  info.node = element;
  expect(info.node).toBe(element);
  expect(info.element).toBe(element);
  info.nodeProperty = "contentText";
  expect(info.nodeProperty).toBe("contentText");
  info.nodePropertyElements = ["style","display"];
  expect(info.nodePropertyElements).toEqual(["style","display"]);
  info.viewModelProperty = "value";
  expect(info.viewModelProperty).toBe("value");
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  info.viewModelProperty = "$1";
  expect(info.viewModelProperty).toBe("$1");
  expect(info.isContextIndex).toBe(true);
  expect(info.contextIndex).toBe(0);
  info.viewModelProperty = "$2";
  expect(info.viewModelProperty).toBe("$2");
  expect(info.isContextIndex).toBe(true);
  expect(info.contextIndex).toBe(1);
  info.viewModelProperty = "aaa";
  info.indexes = [];
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("aaa\t");
  info.indexes = [1];
  expect(info.indexes).toEqual([1]);
  expect(info.indexesString).toBe("1");
  expect(info.viewModelPropertyKey).toBe("aaa\t1");
  info.indexes = [1,2];
  expect(info.indexes).toEqual([1,2]);
  expect(info.indexesString).toBe("1,2");
  expect(info.viewModelPropertyKey).toBe("aaa\t1,2");

  let calledDirectlySet = undefined;
  const viewModel = {
    [Symbols.directlyGet](prop, indexes) {
      return { prop, indexes };
    },
    [Symbols.directlySet](prop, indexes, value) {
      calledDirectlySet = { prop, indexes, value };
    }
  };
  info.viewModel = viewModel;
  info.contextIndexes = [ 1, 2, 3 ];
  info.viewModelProperty = "$1";
  expect(info.getViewModelValue()).toBe(1);
  info.viewModelProperty = "$2";
  expect(info.getViewModelValue()).toBe(2);
  info.viewModelProperty = "$3";
  expect(info.getViewModelValue()).toBe(3);
  info.viewModelProperty = "$4";
  expect(info.getViewModelValue()).toBe(undefined);
  info.indexes = [ 4, 5, 6 ];
  info.viewModelProperty = "bbb";
  expect(info.getViewModelValue()).toEqual({prop:"bbb",indexes:[4,5,6]});

  calledDirectlySet = undefined;
  info.indexes = [ 4, 5, 6 ];
  info.viewModelProperty = "bbb";
  info.setViewModelValue(100);
  expect(calledDirectlySet).toEqual({prop:"bbb",indexes:[4,5,6], value:100});
  calledDirectlySet = undefined;
  info.viewModelProperty = "$1";
  info.setViewModelValue(100);
  expect(calledDirectlySet).toBe(undefined);

  const target = new BindInfo();
  target.viewModelProperty = "bbb";
  target.contextIndexes = [1];
  target.indexes = [1];

  info.viewModelProperty = "bbb.*";
  info.contextIndexes = [ 1, 2, 3, 4 ];
  info.indexes = [ 1, 2, 3 ];
  info.changeIndexes(target, 5);
  expect(info.contextIndexes).toEqual([1,7,3,4]);
  expect(info.indexes).toEqual([1,7,3]);

  info.viewModelProperty = "ccc.*";
  info.contextIndexes = [ 1, 2, 3, 4 ];
  info.indexes = [ 1, 2, 3 ];
  info.changeIndexes(target, 5);
  expect(info.contextIndexes).toEqual([1,7,3,4]);
  expect(info.indexes).toEqual([1,2,3]);

  info.updateNode();
  info.updateViewModel();
  info.removeFromParent();

});