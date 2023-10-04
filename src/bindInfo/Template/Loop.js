import { TemplateBind, TemplateChild } from "./Template.js";
import { Context } from "../../context/Context.js";

export class LoopBind extends TemplateBind {

  /** @type {number} */
  #lastCount = 0;
  /** @type {number} */
  get lastCount() {
    return this.#lastCount;
  }
  set lastCount(v) {
    this.#lastCount = v;
  }

  /** @type {TemplateChild | undefined} */
  get lastChild() {
    return this.templateChildren[this.templateChildren.length - 1];
  }

  updateNode() {
    /** @type {any[]} */
    const newValue = this.filteredViewModelValue ?? [];

    if (this.lastCount > newValue.length) {
      // 前の配列の長さ　＞　現在の配列の長さ
      // 現在の配列の長さに合わせるように配列を削除する
      const removeTemplateChildren = this.templateChildren.splice(newValue.length);
      TemplateBind.removeFromParent(removeTemplateChildren);
      // 全ての配列の値をノードへ反映する
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    } else if (this.lastCount < newValue.length) {
      // 前の配列の部分の配列の値をノードへ反映する
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
      // 足りない部分を生成し追加する
      const pos = this.context.indexes.length;
      const propName = this.viewModelPropertyName;
      const parentIndexes = this.contextParam?.indexes ?? [];
      const newTemplateChildren = [];
      for(let i = this.lastCount; i < newValue.length; i++) {
        const newIndex = i;
        const newContext = Context.clone(this.context);
        newContext.indexes.push(newIndex);
        newContext.stack.push({propName, indexes:parentIndexes.concat(newIndex), pos})
        newTemplateChildren.push(TemplateChild.create(this, newContext))
      }
      TemplateBind.appendToParent(this.lastChild?.lastNode ?? this.node, newTemplateChildren);
      this.templateChildren = this.templateChildren.concat(newTemplateChildren);
    } else {
      // 全ての配列の値をノードへ反映する
      this.templateChildren.forEach(templateChild => templateChild.updateNode());
    }
    this.lastCount = newValue.length;
  }

  removeFromParent() {
    TemplateBind.removeFromParent(this.templateChildren);
    this.templateChildren = [];
    this.lastCount = 0;
  }
}