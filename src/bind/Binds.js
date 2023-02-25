import Template from "../bindInfo/Template.js";
import BindInfo from "../bindInfo/BindInfo.js";

const toTemplate = bind => (bind instanceof Template) ? bind : undefined;

export default class {
  /**
   * @type {BindInfo[]}
   */
  #binds;
  /**
   * @type {Map<string,BindInfo[]>}
   */
  #bindsByKey = new Map;
  constructor(binds) {
    this.#binds = binds;
    this.buildMap();
  }

  buildMap() {
    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const buildMap = (binds) => {
      binds.forEach(bind => {
        this.#bindsByKey.get(bind.viewModelPropertyKey)?.push(bind) ?? this.#bindsByKey.set(bind.viewModelPropertyKey, [ bind ]);
        (toTemplate(bind)?.templateChildren ?? []).forEach(templateChild => buildMap(templateChild.binds));
      });
    }
    this.#bindsByKey.clear();
    buildMap(this.#binds);
  }
  /**
   * 
   * @param {Set<string>} setOfKey 
   * @returns {Template[]}
   */
  getTemplateBinds(setOfKey) {
    const templateBinds = [];
    const stack = [ { binds:this.#binds, children:null, index:-1 } ];
    while(stack.length > 0) {
      const info = stack[stack.length - 1];
      info.index++;
      if (info.binds) {
        if (info.index < info.binds.length) {
          const template = toTemplate(info.binds[info.index]);
          if (template) {
            if (setOfKey.has(template.viewModelPropertyKey)) {
              templateBinds.push(template);
            } else {
              if (template.templateChildren.length > 0) {
                stack.push({ binds:null, children:template.templateChildren, index:-1 });
              }
            }
          }
        } else {
          stack.pop();
        }
      } else {
        if (info.index < info.children.length) {
          const child = info.children[info.index];
          if (child.binds.length > 0) {
            stack.push({ binds:child.binds, children:null, index:-1 });
          }
        } else {
          stack.pop();
        }
      }
    }

    return templateBinds;
  }
  /**
   * 
   * @param {Set<string>} setOfKey 
   */
  updateViewModel(setOfKey) {
    /**
     * @type {Template[]}
     */
    const templateBinds = this.getTemplateBinds(setOfKey);
    if (templateBinds.length > 0) {
      templateBinds.forEach(bind => bind.expand());
      this.buildMap();
    }

    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const updateViewModelProperty = (binds) => {
      binds.forEach(bind => {
        if (setOfKey.has(bind.viewModelPropertyKey)) {
          bind.updateNode();
        }
        toTemplate(bind)?.templateChildren.forEach(templateChild => updateViewModelProperty(templateChild.binds))
      });
    }
    updateViewModelProperty(this.#binds);
  }

}