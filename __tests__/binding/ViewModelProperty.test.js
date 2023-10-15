import "../../src/types.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";
import { Symbols } from "../../src/Symbols.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { MultiValue } from "../../src/binding/nodePoperty/MultiValue.js";
import { outputFilters } from "../../src/filter/Builtin.js";

class ViewModel {
  /**
   * 
   * @param {PropertyName} propertyName 
   * @param {number[]} indexes 
   */
  [Symbols.directlyGet](propertyName, indexes) {
    let index = indexes.length - 1;
    const getter = (paths) => {
      if (paths.length === 0) return this;
      let last = paths.pop();
      if (last === "*") {
        last = indexes[index];
        index--;
      }
      return getter(paths)[last];
    }
    return getter(propertyName.pathNames.slice());
  }

  /**
   * 
   * @param {PropertyName} propertyName 
   * @param {number[]} indexes 
   * @param {any} value
   */
  [Symbols.directlySet](propertyName, indexes, value) {
    let index = indexes.length - 1;
    let last = propertyName.lastPathName;
    if (last === "*") {
      last = indexes[index];
      index--;
    }
    const getter = (paths) => {
      if (paths.length === 0) return this;
      let last = paths.pop();
      if (last === "*") {
        last = indexes[index];
        index--;
      }
      return getter(paths)[last];
    }
    getter(propertyName.parentPathNames.slice())[last] = value;
  }

  aaa = 100;
  bbb = [10, 20, 30];
  ccc = "abc";
}

test("ViewModelProperty property access", () => {
  const viewModel = new ViewModel();
  {
    const context = { indexes:[], stack:[] };
    const viewModelProperty = new ViewModelProperty(viewModel, "aaa", context, [], {});
    expect(viewModelProperty.context).toEqual({ indexes:[], stack:[] });
    expect(viewModelProperty.contextParam).toBe(undefined);
    expect(viewModelProperty.indexes).toEqual([]);
    expect(viewModelProperty.filters).toEqual([]);
    expect(viewModelProperty.filterFuncs).toEqual({});
    expect(viewModelProperty.viewModel).toBe(viewModel);
    expect(viewModelProperty.value).toBe(100);
    expect(viewModelProperty.filteredValue).toBe(100);
    expect(viewModelProperty.applicable).toBe(true);
    viewModelProperty.value = 200;
    expect(viewModelProperty.value).toBe(200);
    expect(viewModelProperty.filteredValue).toBe(200);
    expect(viewModel.aaa).toBe(200);
  }
  {
    const context = { indexes:[0], stack:[{propName: new PropertyName("bbb"), indexes:[0], pos:1}] };
    const viewModelProperty = new ViewModelProperty(viewModel, "bbb.*", context, [], {});
    expect(viewModelProperty.context).toEqual({ indexes:[0], stack:[{propName: new PropertyName("bbb"), indexes:[0], pos:1}] });
    expect(viewModelProperty.contextParam).toEqual({propName: new PropertyName("bbb"), indexes:[0], pos:1});
    expect(viewModelProperty.indexes).toEqual([0]);
    expect(viewModelProperty.filters).toEqual([]);
    expect(viewModelProperty.filterFuncs).toEqual({});
    expect(viewModelProperty.viewModel).toBe(viewModel);
    expect(viewModelProperty.value).toBe(10);
    expect(viewModelProperty.filteredValue).toBe(10);
    viewModelProperty.value = 15;
    expect(viewModelProperty.value).toBe(15);
    expect(viewModelProperty.filteredValue).toBe(15);
    expect(viewModel.bbb).toEqual([15,20,30]);

    const newContext = { indexes:[1], stack:[{propName: new PropertyName("bbb"), indexes:[1], pos:1}] };
    viewModelProperty.context = newContext;
    expect(viewModelProperty.context).toEqual({ indexes:[1], stack:[{propName: new PropertyName("bbb"), indexes:[1], pos:1}] });
    expect(viewModelProperty.contextParam).toEqual({propName: new PropertyName("bbb"), indexes:[1], pos:1});
    expect(viewModelProperty.value).toBe(20);
    viewModelProperty.value = 25;
    expect(viewModelProperty.value).toBe(25);
    expect(viewModel.bbb).toEqual([15,25,30]);
  }
  {
    viewModel.aaa = 100;
    const context = { indexes:[], stack:[] };
    const viewModelProperty = new ViewModelProperty(viewModel, "aaa", context, [], {});
    expect(viewModelProperty.value).toBe(100);
    viewModelProperty.value = new MultiValue(150, false);
    expect(viewModelProperty.value).toBe(100);
    expect(viewModel.aaa).toBe(100);
    viewModelProperty.value = new MultiValue(150, true);
    expect(viewModelProperty.value).toBe(150);
    expect(viewModel.aaa).toBe(150);
    viewModelProperty.value = new MultiValue(200, true);
    expect(viewModelProperty.value).toBe(200);
    expect(viewModel.aaa).toBe(200);
  }
  {
    viewModel.bbb = [10,20,30];
    const context = { indexes:[], stack:[] };
    const viewModelProperty = new ViewModelProperty(viewModel, "bbb", context, [], {});
    expect(viewModelProperty.value).toEqual([10,20,30]);
    viewModelProperty.value = new MultiValue(10, false);
    expect(viewModelProperty.value).toEqual([20,30]);
    expect(viewModel.bbb).toEqual([20,30]);
    viewModelProperty.value = new MultiValue(10, true);
    expect(viewModelProperty.value).toEqual([20,30,10]);
    expect(viewModel.bbb).toEqual([20,30,10]);
    viewModelProperty.value = new MultiValue(40, true);
    expect(viewModelProperty.value).toEqual([20,30,10,40]);
    expect(viewModel.bbb).toEqual([20,30,10,40]);
  }
  {
    const context = { indexes:[], stack:[] };
    const viewModelProperty = new ViewModelProperty(viewModel, "ccc", context,  [{name:"toUpperCase", options:[]}], outputFilters);
    expect(viewModelProperty.value).toBe("abc");
    expect(viewModelProperty.filteredValue).toBe("ABC");
    viewModelProperty.value = "def";
    expect(viewModelProperty.value).toBe("def");
    expect(viewModelProperty.filteredValue).toBe("DEF");
    expect(viewModel.ccc).toBe("def");
  }

});