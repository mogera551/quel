
# ノードプロパティの型変換の自動化

# 外部コンポーネントとして使用する
## コンポーネントの定義方法
色々なコンポーネントの登録方法

### オールインワン型
コンポーネントクラスの定義、タグ名の登録を１つのファイルで行うオールインワン型

* 良い点
  * scriptタグを追加するだけで、カスタムコンポーネントを利用できる
* 悪い点
  * registerComponentModules関数, getCustomTagFromImportMeta関数を呼び出す必要がある
  * 利用する側でタグ名の変更ができない→パラメータで渡すことで解決できる

どんな場面で利用するか、独立して提供されるコンポーネント

`component.js`
```js
import { registerComponentModules, getCustomTagFromImportMeta } from "./path/to/quel.min.js";

const html;

class ViewModel {}

const customTag = getCustomTagFromImportMeta(import.meta);
!customTag && throw "no custom tag name";

registerComponentModules({ [customTag]: { html, ViewModel } });
```

`index.html`
```html
<script type="module" src="./component.js?myComponent"></script>

<my-component></my-component>
```

### Webコンポーネント型
Webコンポーネントクラスを定義するWebコンポーネント型
* 良い点
  * Web標準準拠のWebコンポーネントクラスを取得できる
  * 利用する側(index.html)でquelを呼び出す必要がない
  * 利用する側でタグ名の変更ができる
* 悪い点
  * generateComponentClass関数を呼び出す必要がある
  * 呼び出す側で登録するコードが必要

どんな場面で利用するか、Web標準準拠のWebコンポーネントが必要な場合

`component.js`
```js
import { generateComponentClass } from "./path/to/quel.min.js";

const html;

class ViewModel {}

export default generateComponentClass({ html, ViewModel });
```

`index.html`
```html
<my-component></my-component>

<script type="module">
import myComponent from "./component.js";

customElements.define("my-component", myComponent);
</script>
```

### コンポーネントモジュール型
コンポーネントモジュールの要素だけを定義するコンポーネントモジュール型
* 良い点
  * 利用する側でタグ名の変更ができる
  * コンポーネントを定義する側で、quelを呼び出す必要がない→ポータビリティ、シンプルでわかりやすい
* 悪い点
  * 利用する側(index.html)でquelを呼び出す必要がある
  * 呼び出す側で登録するコードが必要

どんな場面で利用するか、Quelだけでコンポーネントを構築する場合

`component.js`
```js
export const html;

export class ViewModel {}

```

`index.html`
```html
<my-component></my-component>

<script type="module">
import { registerComponentModules } from "./path/to/quel.min.js";
import * as myComponent from "./component";

registerComponentModules({ myComponent });
</script>
```


import { registerComponentModules, generateComponentClass } from "./path/to/quel.min.js";
import * as componentModlue from "./componentModlue.js";

registerComponentModules({componentModlue});

const componentClass = generateComponentClass(componentModlue);





const memberList = document.createElement("member-list");
memberList.props.members = members;
body.appendChild(memberList);

# shadow rootへのcssの適用

# validationへの対応
https://developer.mozilla.org/ja/docs/Learn/Forms/Form_validation

# <details>: 詳細折りたたみ要素への対応
https://developer.mozilla.org/ja/docs/Web/HTML/Element/details

# form submitの推奨される実装

# ループコンテキストからポップオーバー
ex.
{{ list.* }}
  <div>{{ list.*.name }}, <button type="button" popovertarget="detail-edit">edit</button>
{{ end: }}
<detail-edit id="detail-edit" data-bind="props.name:list.*.name"></detail-edit>

# ループコンテキストからダイアログ表示
{{ list.* }}
  <div>{{ list.*.name }}, <button type="button" invoketarget="detail-edit" invokeaction="open">edit</button>
{{ end: }}
<dialog is="detail-edit" id="detail-edit" data-bind="props.name:list.*.name"></dialog>

フォームコントロールと見なされる要素
https://developer.mozilla.org/ja/docs/Web/API/HTMLFormElement

# shadowrootmodeの利用の検討

# 属性変更を修正
observedAttributes
attributeChangedCallback

# リファクタリング 2024/06/24
## スレッドの部分の見直し
### 問題点
* スレッドでやるべきことと、バインドのアップデートでやることの区別があいまい
* スレッドのフェーズを考え直す
   * Stateの値更新、もしくはイベントハンドラ実行＝プロセス実行
   * その際、Stateの更新したプロパティを収集しておく
   * 全てのプロセスの実行が終わったら
   * Stateのプロパティ更新コールバックをコール
   * Stateの更新したプロパティから、依存関係にあるStateのプロパティを取得(Stateプロパティの展開)
   * 展開されたStateプロパティをもとに、
      * バインディングの再構築
      * セレクト以外のノードへ値の反映
      * セレクトのノードへ値の反映
      * 子コンポーネントへの反映（要検討）

```js


const UpdateCycleState = {
  Sleeping: 0,
  UpdatingState: 1, // Update State 
  UpdatedState: 2, // Updated State , calling $updatedCallback
  ExpandStateProps: 3, // Expand State properties
  RebuildBindings: 4,
  ApplyToNode: 5,
  ApplyToSelectNode: 6,
  ApplyToSubComponent: 7,
}

class ComponentUpdator {
  component;
  state;
  processQueue = [];
  updatedStateProperties = [];
  expandedStateProperties = [];
  executing = false;

  addProcess(proc) {
    this.processQueue.push(proc);
    this.exec();
  }

  async exec() {
    if (this.executing) return;
    this.executing = true;
    try {
      while(this.processQueue.length > 0) {
        let proc;
        while(proc = this.processQueue.pop()) {
          await proc.exec();
        }
        await this.component.viewModel[Symbols.updatedCallback)();
      }

    } finally {
      this.executing = false;
    }
  }


}
```
