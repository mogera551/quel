import {expect, jest, test} from '@jest/globals';

jest.unstable_mockModule('../../src/binding/nodeProperty/Repeat.js', () => {
  return {
    Repeat: class Repeat {
      constructor() {
        this.name = "Repeat";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/Branch.js', () => {
  return {
    Branch: class Branch {
      constructor() {
        this.name = "Branch";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/viewModelProperty/ViewModelProperty.js', () => {
  return {
    ViewModelProperty: class ViewModelProperty {
      constructor() {
        this.name = "ViewModelProperty";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/viewModelProperty/ContextIndex.js', () => {
  return {
    ContextIndex: class ContextIndex {
      constructor() {
        this.name = "ContextIndex";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/NodeProperty.js', () => {
  return {
    NodeProperty: class NodeProperty {
      constructor() {
        this.name = "NodeProperty";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementClassName.js', () => {
  return {
    ElementClassName: class ElementClassName {
      constructor() {
        this.name = "ElementClassName";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/Checkbox.js', () => {
  return {
    Checkbox: class Checkbox {
      constructor() {
        this.name = "Checkbox";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/Radio.js', () => {
  return {
    Radio: class Radio {
      constructor() {
        this.name = "Radio";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementEvent.js', () => {
  return {
    ElementEvent: class ElementEvent {
      constructor() {
        this.name = "ElementEvent";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementClass.js', () => {
  return {
    ElementClass: class ElementClass {
      constructor() {
        this.name = "ElementClass";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementAttribute.js', () => {
  return {
    ElementAttribute: class ElementAttribute {
      constructor() {
        this.name = "ElementAttribute";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementStyle.js', () => {
  return {
    ElementStyle: class ElementStyle {
      constructor() {
        this.name = "ElementStyle";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ElementProperty.js', () => {
  return {
    ElementProperty: class ElementProperty {
      constructor() {
        this.name = "ElementProperty";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/ComponentProperty.js', () => {
  return {
    ComponentProperty: class ComponentProperty {
      constructor() {
        this.name = "ComponentProperty";
      }
    }
  }
});
jest.unstable_mockModule('../../src/binding/nodeProperty/RepeatKeyed.js', () => {
  return {
    RepeatKeyed: class RepeatKeyed {
      constructor() {
        this.name = "RepeatKeyed";
      }
    }
  }
});

const { getConstructors } = await import("../../src/newBinder/constructors.js");

describe("getConstructors", () => {
  
    it("should return Repeat and ViewModelProperty", () => {
      const node = document.createComment("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "loop", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("Repeat");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return RepeatKeyed and ViewModelProperty", () => {
      const node = document.createComment("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "loop", "viewModelProperty", true);
      expect(nodePropertyConstructor.name).toBe("RepeatKeyed");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return Branch and ViewModelProperty", () => {
      const node = document.createComment("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "if", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("Branch");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementClassName and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "class", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementClassName");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return Checkbox and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "checkbox", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("Checkbox");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return Radio and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "radio", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("Radio");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementEvent and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "onevent", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementEvent");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementClass and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "class.abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementClass");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementAttribute and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "attr.abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementAttribute");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementStyle and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "style.abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementStyle");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ComponentProperty and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "props.abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ComponentProperty");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return Repeat and ContextIndex", () => {
      const node = document.createComment("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "loop", "$1", false);
      expect(nodePropertyConstructor.name).toBe("Repeat");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return Branch and ContextIndex", () => {
      const node = document.createComment("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "if", "$1", false);
      expect(nodePropertyConstructor.name).toBe("Branch");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementClassName and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "class", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementClassName");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return Checkbox and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "checkbox", "$1", false);
      expect(nodePropertyConstructor.name).toBe("Checkbox");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return Radio and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "radio", "$1", false);
      expect(nodePropertyConstructor.name).toBe("Radio");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementEvent and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "onevent", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementEvent");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementClass and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "class.abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementClass");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementAttribute and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "attr.abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementAttribute");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementStyle and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "style.abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementStyle");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ComponentProperty and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "props.abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ComponentProperty");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return NodeProperty and ViewModelProperty", () => {
      const node = document.createTextNode("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("NodeProperty");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return NodeProperty and ContextIndex", () => {
      const node = document.createTextNode("");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("NodeProperty");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("should return ElementProperty and ViewModelProperty", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "abc", "viewModelProperty", false);
      expect(nodePropertyConstructor.name).toBe("ElementProperty");
      expect(viewModelPropertyConstructor.name).toBe("ViewModelProperty");
    });
    it("should return ElementProperty and ContextIndex", () => {
      const node = document.createElement("div");
      const { nodePropertyConstructor, viewModelPropertyConstructor } = getConstructors(node, "abc", "$1", false);
      expect(nodePropertyConstructor.name).toBe("ElementProperty");
      expect(viewModelPropertyConstructor.name).toBe("ContextIndex");
    });
    it("raise error if no constructor found", () => {
      const node = document.createComment("");
      expect(() => getConstructors(node, "abc", "viewModelProperty", false)).toThrow();
    });
});