import 'jest';
import { IContentBindingsBase, INewBindingBase } from "../../src/newBinding/types";
import { LoopContext } from "../../src/newLoopContext/LoopContext";

class ContentBindingsBase implements IContentBindingsBase {
  parentBinding: INewBindingBase | undefined;
  childrenBinding: INewBindingBase[];
  loopContext: LoopContext | undefined;
  constructor(parentBinding?: INewBindingBase) {
    this.childrenBinding = [];
    if (typeof parentBinding !== "undefined") {
      this.parentBinding = parentBinding;
      this.parentBinding?.childrenContentBindings.push(this);
      if (this.parentBinding.loopable) {
        this.loopContext = new LoopContext(this);
      }
    }
  }
}

class Binding implements INewBindingBase {
  parentContentBindings: IContentBindingsBase;
  childrenContentBindings: IContentBindingsBase[];
  loopable: boolean;
  constructor(parentContentBindings: IContentBindingsBase, loopable: boolean) {
    this.parentContentBindings = parentContentBindings;
    this.parentContentBindings.childrenBinding.push(this);
    this.childrenContentBindings = [];
    this.loopable = loopable;
  }
}

describe("LoopContext", () => {
  it("should only contentBindings", () => {
    const contentBindings = new ContentBindingsBase();
    expect(contentBindings.loopContext).toBeUndefined();
    expect(contentBindings.loopContext?.parentLoopContext).toBeUndefined();
  });
  it("should contentBindings-contentBindings", () => {
    const contentBindings = new ContentBindingsBase();
    const binding = new Binding(contentBindings, true);
    const contentBindings2 = new ContentBindingsBase(binding);
    expect(contentBindings2.loopContext).toBeInstanceOf(LoopContext);
    expect(contentBindings2.loopContext?.parentLoopContext).toBeUndefined();
    expect(contentBindings2.loopContext?.index).toBe(0);
    expect(contentBindings2.loopContext?.indexes).toEqual([0]);
  });
  it("should contentBindings-2contentBindings", () => {
    const contentBindings = new ContentBindingsBase();
    const binding = new Binding(contentBindings, true);
    const contentBindings2 = new ContentBindingsBase(binding);
    const contentBindings3 = new ContentBindingsBase(binding);
    expect(contentBindings2.loopContext).toBeInstanceOf(LoopContext);
    expect(contentBindings2.loopContext?.parentLoopContext).toBeUndefined();
    expect(contentBindings2.loopContext?.index).toBe(0);
    expect(contentBindings2.loopContext?.indexes).toEqual([0]);
    expect(contentBindings3.loopContext).toBeInstanceOf(LoopContext);
    expect(contentBindings3.loopContext?.parentLoopContext).toBeUndefined();
    expect(contentBindings3.loopContext?.index).toBe(1);
    expect(contentBindings3.loopContext?.indexes).toEqual([1]);
  });
  it("should contentBindings-contentBindings-contentBindings", () => {
    const contentBindings = new ContentBindingsBase();
    const binding = new Binding(contentBindings, true);
    const contentBindings2 = new ContentBindingsBase(binding);
    const binding2 = new Binding(contentBindings2, true);
    const contentBindings3 = new ContentBindingsBase(binding2);
    expect(contentBindings2.loopContext).toBeInstanceOf(LoopContext);
    expect(contentBindings2.loopContext?.parentLoopContext).toBeUndefined();
    expect(contentBindings2.loopContext?.index).toBe(0);
    expect(contentBindings2.loopContext?.indexes).toEqual([0]);
    expect(contentBindings3.loopContext).toBeInstanceOf(LoopContext);
    expect(contentBindings3.loopContext?.parentLoopContext).toBe(contentBindings2.loopContext);
    expect(contentBindings3.loopContext?.index).toBe(0);
    expect(contentBindings3.loopContext?.indexes).toEqual([0,0]);

    expect(contentBindings2.loopContext?.index).toBe(0);
    expect(contentBindings2.loopContext?.indexes).toEqual([0]);
    expect(contentBindings3.loopContext?.index).toBe(0);
    expect(contentBindings3.loopContext?.indexes).toEqual([0,0]);

    contentBindings2.loopContext?.clearIndex();
    contentBindings3.loopContext?.clearIndex();

    expect(contentBindings2.loopContext?.index).toBe(0);
    expect(contentBindings2.loopContext?.indexes).toEqual([0]);
    expect(contentBindings3.loopContext?.index).toBe(0);
    expect(contentBindings3.loopContext?.indexes).toEqual([0,0]);
  });
  it("should contentBindings-contentBindings no loopable", () => {
    const contentBindings = new ContentBindingsBase();
    const binding = new Binding(contentBindings, false);
    expect(() => {
      const contentBindings = new ContentBindingsBase(binding);
      new LoopContext(contentBindings);
    }).toThrow("parentBinding is not loopable");
  });
});
