import "../../src/types.js";
import { ViewModelProperty } from "../../src/binding/ViewModelProperty.js";
import { Symbols } from "../../src/Symbols.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

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
    viewModelProperty.value = 200;
    expect(viewModelProperty.value).toBe(200);
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
    viewModelProperty.value = 15;
    expect(viewModelProperty.value).toBe(15);
    expect(viewModel.bbb).toEqual([15,20,30]);
  }

});