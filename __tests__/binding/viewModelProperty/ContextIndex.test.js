import "../../../src/types.js";
import { ContextIndex } from "../../../src/binding/viewModelProperty/ContextIndex.js";
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
    const context = { indexes:[0], stack:[] };
    binding.context = context;
    const cntextIndex = new ContextIndex(binding, viewModel, "$1", [], {});
    expect(cntextIndex.binding).toBe(binding);
    expect(cntextIndex.viewModel).toBe(viewModel);
    expect(cntextIndex.name).toBe("$1");
    expect(cntextIndex.propertyName).toEqual(PropertyName.create("$1"));
    expect(cntextIndex.index).toBe(0);
    expect(cntextIndex.indexes).toEqual([]);
    expect(cntextIndex.indexesString).toBe("");
    expect(cntextIndex.filters).toEqual([]);
    expect(cntextIndex.filterFuncs).toEqual({});
    expect(cntextIndex.viewModel).toBe(viewModel);
    expect(cntextIndex.value).toBe(0);
    expect(cntextIndex.filteredValue).toBe(0);
    expect(cntextIndex.applicable).toBe(true);
  }
  {
    const context = { indexes:[0,1], stack:[] };
    binding.context = context;
    {
      const cntextIndex = new ContextIndex(binding, viewModel, "$1", [], {});
      expect(cntextIndex.binding).toBe(binding);
      expect(cntextIndex.viewModel).toBe(viewModel);
      expect(cntextIndex.name).toBe("$1");
      expect(cntextIndex.propertyName).toEqual(PropertyName.create("$1"));
      expect(cntextIndex.indexes).toEqual([]);
      expect(cntextIndex.indexesString).toBe("");
      expect(cntextIndex.index).toBe(0);
      expect(cntextIndex.filters).toEqual([]);
      expect(cntextIndex.filterFuncs).toEqual({});
      expect(cntextIndex.viewModel).toBe(viewModel);
      expect(cntextIndex.value).toBe(0);
      expect(cntextIndex.filteredValue).toBe(0);
      expect(cntextIndex.applicable).toBe(true);
    }
    {
      const cntextIndex = new ContextIndex(binding, viewModel, "$2", [], {});
      expect(cntextIndex.binding).toBe(binding);
      expect(cntextIndex.viewModel).toBe(viewModel);
      expect(cntextIndex.name).toBe("$2");
      expect(cntextIndex.propertyName).toEqual(PropertyName.create("$2"));
      expect(cntextIndex.indexes).toEqual([]);
      expect(cntextIndex.indexesString).toBe("");
      expect(cntextIndex.index).toBe(1);
      expect(cntextIndex.filters).toEqual([]);
      expect(cntextIndex.filterFuncs).toEqual({});
      expect(cntextIndex.viewModel).toBe(viewModel);
      expect(cntextIndex.value).toBe(1);
      expect(cntextIndex.filteredValue).toBe(1);
      expect(cntextIndex.applicable).toBe(true);
    }
    {
      expect(() => {
        const cntextIndex = new ContextIndex(binding, viewModel, "$$2", [], {});
      }).toThrow("invalid name $$2");
    }
  }
});