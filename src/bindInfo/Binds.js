import "../types.js";
import { NewTemplateBind } from "./NewTemplate.js";

const toTemplateBind = bind => (bind instanceof NewTemplateBind) ? bind : undefined;

export class Binds {
  /**
   * 
   * @param {BindInfo[]} binds
   * @param {Set<string>} setOfKey 
   * @returns {Template[]}
   */
  static getTemplateBinds(binds, setOfKey) {
    const templateBinds = [];
    const stack = [ { binds, children:null, index:-1 } ];
    while(stack.length > 0) {
      const info = stack[stack.length - 1];
      info.index++;
      if (info.binds) {
        if (info.index < info.binds.length) {
          const template = toTemplateBind(info.binds[info.index]);
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
   * updateされたviewModelのプロパティにバインドされているnodeのプロパティを更新する
   * @param {BindInfo[]} binds
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  static applyToNode(binds, setOfUpdatedViewModelPropertyKeys) {
    // templateを先に展開する
    /**
     * @type {Set<Template>}
     */
    const templateBinds = new Set(this.getTemplateBinds(binds, setOfUpdatedViewModelPropertyKeys));
    if (templateBinds.size > 0) {
      for(const templateBind of templateBinds) {
        templateBind.updateNode();
      }
    }

    /**
     * 
     * @param {BindInfo[]} binds 
     */
    const updateNode = (binds) => {
      binds.forEach(bind => {
        if (!templateBinds.has(bind) && setOfUpdatedViewModelPropertyKeys.has(bind.viewModelPropertyKey)) {
          bind.updateNode();
        }
        toTemplateBind(bind)?.templateChildren.forEach(templateChild => updateNode(templateChild.binds))
      });
    }
    updateNode(binds);
  }

}