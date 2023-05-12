import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { BindInfo } from "../../src/bindInfo/BindInfo.js";
import { Symbols } from "../../src/viewModel/Symbols.js";

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
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("value"));
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("value")); // 2度目のアクセス
  expect(info.isContextIndex).toBe(false);
  expect(info.isContextIndex).toBe(false); // 2度目のアクセス
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextIndex).toBe(undefined); // 2度目のアクセス
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexes).toEqual([]); // 2度目のアクセス
  expect(info.indexesString).toBe("");
  expect(info.indexesString).toBe(""); // 2度目のアクセス
  expect(info.viewModelPropertyKey).toBe("value\t");
  expect(info.viewModelPropertyKey).toBe("value\t"); // 2度目のアクセス

  info.viewModelProperty = "$1";
  expect(info.viewModelProperty).toBe("$1");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("$1"));
  expect(info.isContextIndex).toBe(true);
  expect(info.contextIndex).toBe(0);
  expect(info.contextIndex).toBe(0); // 2度目のアクセス
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("$1\t");

  info.viewModelProperty = "$2";
  expect(info.viewModelProperty).toBe("$2");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("$2"));
  expect(info.isContextIndex).toBe(true);
  expect(info.contextIndex).toBe(1);
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("$2\t");
  info.context = {
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
  info.viewModelProperty = "aaa";
  expect(info.viewModelProperty).toBe("aaa");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("aaa"));
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("aaa\t");
  expect(info.contextIndexes).toEqual([5,1,2]);

  info.viewModelProperty = "aaa.*";
  expect(info.viewModelProperty).toBe("aaa.*");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("aaa.*"));
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextParam).toEqual({
    indexes:[1], pos:1, propName:PropertyName.create("aaa")
  });
  expect(info.indexes).toEqual([1]);
  expect(info.indexesString).toBe("1");
  expect(info.viewModelPropertyKey).toBe("aaa.*\t1");
  expect(info.contextIndexes).toEqual([5,1,2]);

  info.viewModelProperty = "aaa.*.*";
  expect(info.viewModelProperty).toBe("aaa.*.*");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("aaa.*.*"));
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextParam).toEqual({
    indexes:[1,2], pos:2, propName:PropertyName.create("aaa.*")
  });
  expect(info.indexes).toEqual([1,2]);
  expect(info.indexesString).toBe("1,2");
  expect(info.viewModelPropertyKey).toBe("aaa.*.*\t1,2");
  expect(info.contextIndexes).toEqual([5,1,2]);

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
  info.viewModelProperty = "$1";
  expect(info.getViewModelValue()).toBe(5);
  info.viewModelProperty = "$2";
  expect(info.getViewModelValue()).toBe(1);
  info.viewModelProperty = "$3";
  expect(info.getViewModelValue()).toBe(2);
  info.viewModelProperty = "$4";
  expect(info.getViewModelValue()).toBe(undefined);
  info.viewModelProperty = "bbb.*";
  expect(info.getViewModelValue()).toEqual({prop:"bbb.*",indexes:[5]});

  calledDirectlySet = undefined;
  info.viewModelProperty = "bbb.*";
  info.setViewModelValue(100);
  expect(calledDirectlySet).toEqual({prop:"bbb.*",indexes:[5], value:100});
  calledDirectlySet = undefined;
  info.viewModelProperty = "$1";
  info.setViewModelValue(100);
  expect(calledDirectlySet).toBe(undefined);

  info.viewModelProperty = "bbb.*";
  info.changeIndexes(PropertyName.create("bbb"), 4);
  expect(info.contextIndexes).toEqual([5,1,2]);
  expect(info.indexes).toEqual([5]);

  info.viewModelProperty = "aaa.*";
  info.changeIndexes(PropertyName.create("aaa"), -1);
  expect(info.contextIndexes).toEqual([5,1,2]);
  expect(info.indexes).toEqual([1]);

  info.viewModelProperty = "aaa.*.*";
  info.changeIndexes(PropertyName.create("aaa.*"), 1);
  expect(info.contextIndexes).toEqual([5,1,2]);
  expect(info.indexes).toEqual([1,2]);

  info.viewModelProperty = "ccc.*";
  expect(info.viewModelProperty).toBe("ccc.*");
  expect(info.viewModelPropertyName).toEqual(PropertyName.create("ccc.*"));
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("ccc.*\t");
  expect(info.contextIndexes).toEqual([5,1,2]);

  info.viewModelProperty = "aaa";
  info.viewModelPropertyName.level = 1; // 無理やり
  expect(info.isContextIndex).toBe(false);
  expect(info.contextIndex).toBe(undefined);
  expect(info.contextParam).toBe(undefined);
  expect(info.indexes).toEqual([]);
  expect(info.indexesString).toBe("");
  expect(info.viewModelPropertyKey).toBe("aaa\t");
  expect(info.contextIndexes).toEqual([5,1,2]);

  info.updateNode();
  info.updateViewModel();
  info.removeFromParent();

});