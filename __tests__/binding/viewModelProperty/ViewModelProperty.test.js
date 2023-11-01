import "../../../src/types.js";
import { ViewModelProperty } from "../../../src/binding/viewModelProperty/ViewModelProperty.js";
import { Symbols } from "../../../src/Symbols.js";
import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { MultiValue } from "../../../src/binding/nodeProperty/MultiValue.js";
import { outputFilters } from "../../../src/filter/Builtin.js";

const binding = {
  context: {},
  viewModelPropertyName: undefined,
  get contextParam() {
    const propName = PropertyName.create(this.viewModelPropertyName);
    if (propName.level > 0) {
      return this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
    } else {
      return {};
    }

  }
};

class ViewModel {
  /**
   * 
   * @param {string} name 
   * @param {number[]} indexes 
   */
  [Symbols.directlyGet](name, indexes) {
    const propertyName = PropertyName.create(name);
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
   * @param {string} name 
   * @param {number[]} indexes 
   * @param {any} value
   */
  [Symbols.directlySet](name, indexes, value) {
    const propertyName = PropertyName.create(name);
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
    binding.context = context;
    binding.viewModelPropertyName = "aaa";
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "aaa", [], {});
    expect(viewModelProperty.binding).toBe(binding);
    expect(viewModelProperty.viewModel).toBe(viewModel);
    expect(viewModelProperty.name).toBe("aaa");
    expect(viewModelProperty.propertyName).toEqual(PropertyName.create("aaa"));
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
    binding.context = context;
    binding.viewModelPropertyName = "bbb.*";
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "bbb.*", [], {});
    expect(viewModelProperty.binding).toBe(binding);
    expect(viewModelProperty.viewModel).toBe(viewModel);
    expect(viewModelProperty.name).toBe("bbb.*");
    expect(viewModelProperty.propertyName).toEqual(PropertyName.create("bbb.*"));
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

  }
  {
    viewModel.aaa = 100;
    const context = { indexes:[], stack:[] };
    binding.context = context;
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "aaa", [], {});
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
    binding.context = context;
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "bbb", [], {});
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
    binding.context = context;
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "ccc", [{name:"toUpperCase", options:[]}], outputFilters);
    expect(viewModelProperty.value).toBe("abc");
    expect(viewModelProperty.filteredValue).toBe("ABC");
    viewModelProperty.value = "def";
    expect(viewModelProperty.value).toBe("def");
    expect(viewModelProperty.filteredValue).toBe("DEF");
    expect(viewModel.ccc).toBe("def");
  }
  {
    viewModel.bbb = [10,20,30];
    const context = { indexes:[], stack:[] };
    binding.context = context;
    const viewModelProperty = new ViewModelProperty(binding, viewModel, "bbb", [], {});
    {
      const newContext = viewModelProperty.createChildContext(0);
      expect(newContext).toEqual({
        indexes:[0],
        stack:[{propName:PropertyName.create("bbb"), indexes:[0], pos:0}]
      });
    }
    {
      const newContext = viewModelProperty.createChildContext(1);
      expect(newContext).toEqual({
        indexes:[1],
        stack:[{propName:PropertyName.create("bbb"), indexes:[1], pos:0}]
      });
  
    }
    {
      viewModelProperty.initialize();
    }
  }

});