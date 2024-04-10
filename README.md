
# What is Quel
Quel is declarative, simple, easy, pure javascript framework.

## The motivation for development
"Antithesis to the increasingly complex JavaScript development."

## The main features
* Minimal rules and conventions, as intuitive as possible
* Declarative view descriptions
* No need for other libraries
* No need for transpiling
* Component-based
* **Property description by dot notation**

Simple template
```html
<ul>
  {{ loop:tickets }}
  <li><a data-bind="choose">{{ tickets.*.name }}, {{ tickets.*.price }}</a></li>
  {{ end: }}
</ul>
```

Simple class 
```js
class ViewModel {
  tickets = [
    { name:'first class', price:1000 },
    { name:'business', price:500 },
    { name:'economy', price:100 },
  ];
  choose() {
    alert(`choose ${this["tickets.*.name"]}`);
  }
}
```

## Getting Start
To use Quel, import the necessary functions from the CDN or the downloaded file using the import declaration.
* An `import` declaration is required, so the `script` tag needs `type="module"`.

Example for CDN
```html
<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
</script>
```

Example for downloaded file
```html
<script type="module">
import { registerComponentModules } from "./path/to/quel.min.js"; // path to downloaded file
</script>
```

### Install Test
Display `Welcome to Quel`.

```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN

const html = `
<div>{{ message }}</div>
`;

class ViewModel {
  message = "Welcome to Quel";
}

registerComponentModules({ myappMain:{ html, ViewModel } });
</script>
</html>
```

## The development flow
In component-based development, you will proceed with the following steps:
* Write custom elements in HTML
* Create corresponding component modules
   * Define the HTML template
   * Define the class to store and manipulate state
* Associate custom elements with component modules

### Write custom elements in HTML
You can use autonomous custom elements and customized built-in elements for custom elements. 
The custom element name must include a dash `-`.

Example for custom elements
`index.html`
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<!-- autonomous custom element -->
<myapp-main><myapp-main>

<!-- customized built-in element -->
<div is="myapp-main"></div>

</html>
```

### Create corresponding component modules
A component module consists of an HTML template, and a class that stores and manipulates state.
It is easier to manage if one component module is described in one file.
Here, it is referred to as `main.js`.

#### Define the HTML template.
Define the HTML that will serve as the content of the component.
You describe the embedding of properties defined in the ViewModel class, the association of attribute values of html elements, the association of events, conditional branching, and repetition.
Declare with the variable name `html` and `export` it.

Example for HTML template of component module
`main.js`
```js
export const html = `
<!-- embed -->
<div>{{ count }}</div>

<!-- association of attribute -->
<input data-bind="value:message">

<!-- association of events -->
<button data-bind="onclick:countUp">count up</button>

<!-- conditional branching -->
{{ if:is5Times }}
  <div>It has been pressed more than 5 times.</div>
{{ end: }}

<!-- repetition -->
<ul>
  {{ loop:animals }}
    <li>{{ animals.* }}</li>
  {{ end: }}
</ul>
`;
```

#### Define the class to store and manipulate state
Define the ViewModel class that stores and manipulates the state of the component.
By declaring members that store state as fields within the class, you can handle the state as properties of the class.
Create methods within the class to manipulate the state.
Declare with the class name `ViewModel` and `export` it.
You can also use accessor properties using getters.
note:When using accessor properties, it is necessary to define dependencies.

Example for ViewModel class of component module
`main.js`
```js
export class ViewModel {
  // state
  count = 0;
  message = "welcome to quel";
  animals = [ "cat", "dog", "fox", "pig" ];

  // accessor properties using getters
  get is5Times() {
    return this.count >= 5;
  }

  // manipulate the state
  countUp() {
    this.count++;
  }

  // define dependencies
  // when using accessor properties
  $dependentProps = {
    "is5Times": [ "count" ],
  }
}
```

### Associate custom elements with component modules
You `import` the created component module.
You associate the component module with the custom element name using the registerComponentModules function.

`index.html`
```js
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
import * as myappMain from "./main.js"; // import the created component module

// Associate the component module with the custom element name
registerComponentModules({ "myapp-main":myappMain });

// The custom element name can also be in camel case
registerComponentModules({ "myappMain":myappMain });

// You can describe it more simply using the shorthand notation for object literals
registerComponentModules({ myappMain });
```

## Tutorial
### 前提
The file structure used in the tutorial is as follows.
```
--+-- index.html
  |
  +-- main.js
```

In `index.html`
* Describe the custom element (<myapp-main/>)
* Import `registerComponentModules` function
* Import `main` component module
* associate the component module with the custom element name using the `registerComponentModules` function

Unless otherwise stated, the tutorial will use the contents of the following index.html.

`index.html`
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import { registerComponentModules } from "https://cdn.jsdelivr.net/gh/mogera551/quel@latest/dist/quel.min.js"; // CDN
import * as myappMain from "./main.js";

registerComponentModules({ myappMain });
</script>
</html>
```

In `main.js`,
* You define the HTML template in the `html` variable, `export` it
* In the `ViewModel` class, you define a class that stores and manipulates state, `export` it.

In the tutorial, we will mainly discuss `main.js`.

`main.js`
```js
export const html = `
(HTML Tempate)
`;

export class ViewModel {
  // (State)

  // (Manupilate)

}
```

### Step.1 Embedding properties
* In `html`, enclose the property `message` to be embedded in `{{ }}`
* In `ViewModel`, declare the property `message` that stores the state as a field, and give it an initial value of `welcome to quel`
* The `ViewModel` class is extended by a Proxy after it is instantiated, so you cannot use private fields in the ViewModel class

The content of the `html` variable in `main.js`
```html
<div>{{ message }}</div>
```

The `ViewModel` class in `main.js`
```js
class ViewModel {
  message = "welcome to quel";
  // #message NG, cannnot use private fields
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/KKrbPjJ)


### Step.2 プロパティのバインド
* `html`の要素のプロパティと`ViewModel`クラスのプロパティを関連付けます（バインドする）。
* 要素の`data-bind`属性に`(要素のプロパティ名):(ViewModelクラスのプロパティ名)`と指定します。
   `textContent:message`、`value:message`、`value:season`、`textContent:season`、`disabled:buttonDisable`、`checked:buttonDisable`
* 複数のバインドを指定する場合、セミコロン`;`で区切ります。`disabled:buttonDisable; textContent:season;`
* `ViewModel`クラスのプロパティが更新されると、自動的に`html`の要素のプロパティへ更新が反映されます。
* 入力系要素の場合、入力値に応じて`ViewModel`クラスのプロパティが更新されます。（双方向バインドを参照）

`main.js`の変数`html`の内容
```html
<div>
  <div>{{ message }}</div>
  <div data-bind="textContent:message"></div>
  <!-- 入力系要素 -->
  <input type="text" data-bind="value:message">
</div>
<div>
  <div>{{ season }}</div>
  <!-- 入力系要素 -->
  <select data-bind="value:season">
    <option value="spring">spring</option>
    <option value="summer">summer</option>
    <option value="autumn">autumn</option>
    <option value="winter">winter</option>
  </select>
</div>
<div>
  <button data-bind="disabled:buttonDisable; textContent:season;"></button>
  <label>
    <!-- 入力系要素 -->
    <input type="checkbox" data-bind="checked:buttonDisable">
    button disable
  </label>
</div>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  message = "welcome to quel";
  season = "spring";
  buttonDisable = false;
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/QWzWPzg)

### Step.3 イベントのバインド
* `html`の要素のイベントプロパティ(on～)と`ViewModel`クラスのメソッドを関連付けます。
* 要素の`data-bind`属性に`(要素のイベントプロパティ名):(ViewModelクラスのメソッド名)`と指定します。→`onclick:popup`
* `ViewModel`クラスのメソッドは`Event`オブジェクトを引数に取ります。`checked(e)`

`main.js`の変数`html`の内容
```html
<button type="button" data-bind="onclick:popup">click here</button>
<label>
  <input type="checkbox" data-bind="onclick:checked">checked
</label>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  /**
   * 「click here」ボタンをクリックしたときの処理
   * 「popup!!!」とポップアップ表示
   */
  popup() {
    alert("popup!!!");
  }

  /**
   * 「checked」チェックボックスをクリックしたときの処理
   * チェックボックスの状態により「checked on」もしくは「checked off」とポップアップ表示
   * チェックボックスの状態は、引数で渡されるEventオブジェクトのtarget要素のcheckedプロパティから取得する
   * @param {Event} e Eventオブジェクト
   */
  checked(e) {
    alert(`checked ${e.target.checked ? "on" : "off"}`);
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/ZEVYWER)

### Step.4 アクセサプロパティ
* `get`を使ったアクセサプロパティも埋め込みや、バインドすることができます。
* アクセサプロパティを使う場合、`ViewModel`クラスの`$dependentProps`に依存関係を記述する必要があります。
* 依存関係は、`(アクセサプロパティ名):(参照しているプロパティの列挙)`と記述します。
  `"doubled": [ "counter" ]`、`"is5times": [ "counter" ]`
* 依存関係を記述しないと、`html`の要素の更新が行われません。

`main.js`の変数`html`の内容
```html
<div>{{ counter }}</div>
<div>{{ doubled }}</div>
<!-- 5回以上はボタンを押せなくする -->
<button type="button" data-bind="onclick:countUp; disabled:is5times;">count up</button>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  counter = 1;

  // アクセサプロパティ
  /**
   * counterの値を２倍します。
   * @type {number}
   */
  get doubled() {
    return this.counter * 2;
  }
  /**
   * counterの値が５以上の場合、真を返します。
   * @type {boolean}
   */
  get is5times() {
    return this.counter >= 5;
  }

  /**
   * 「count up」をクリックしたときの処理
   * countを＋１加算する
   */
  countUp() {
    this.counter++;
  }

  // 依存関係を記述します
  $dependentProps = {
    // アクセサプロパティ名:[参照するプロパティ, ... ]
    "doubled": [ "counter" ],
    "is5times": [ "counter" ],
  };
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/abPzKwx)

### Step.5 フィルタ 
* `ViewModel`のプロパティに、出力フィルタを使うことができます。
* プロパティの後ろにパイプ`|`、フィルタ名を記述します。
* フィルタ名の後ろにカンマ`,`で区切ってオプションを指定できます。
* フィルタはパイプ`|`を使って、複数指定できます。
* フィルタは、`String` `Number` `Array`のイミュータブルなメソッドが用意されています。

プロパティの加工という点ではアクセサプロパティと似ていますが、以下の点が異なります。

フィルタの特徴（アクセサプロパティとの違い）
* 依存関係を書く必要がありません。(`$dependentProps`を書かなくていい。)
* 単一のプロパティの出力のみフィルタできます。→フィルタは、複数のプロパティを扱うことはできません。

`main.js`の変数`html`の内容
```html
<div>{{ message }}</div>
<div>{{ message|substring,4,15|toUpperCase }}<!-- QUICK BROWN --></div>

<div>{{ price }}</div>
<div>{{ price|toLocaleString }}<!-- 19,800 --></div>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  message = "The quick brown fox jumps over the lazy dog";
  price = 19800;
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/rNoVevQ)

### Step.6 条件分岐ブロック 
* `ViewModel`のプロパティを条件として、表示を制御することができます。
* 制御するブロック（要素の集合）を`{{ if:(ViewModelのプロパティ) }}`～`{{ end: }}`で括ります。→`{{ if:val }}`～`{{ end: }}`
* `{{ else }}`を使って、偽の条件を表示します。
* `else if`はありません。
* 単一のプロパティを条件とします。→条件は、複数のプロパティを扱うことはできません。

`main.js`の変数`html`の内容
```html
<button type="button" data-bind="onclick:change">change!!!</button>
{{ if:val }}
  <div>val is true</div>
{{ else: }}
  <div>val is false</div>
{{ end: }}
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  val = true;
  change() {
    this.val = !this.val;
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/xxmGadX)

### Step.7 繰り返しブロック 
* `ViewModel`のプロパティを配列として、表示を繰り返すことができます。
* 繰り返すブロック（要素の集合）を`{{ loop:(ViewModelのプロパティ) }}`～`{{ end: }}`で括ります。
   * `{{ loop:animals }}`～`{{ end: }}`
   * `{{ loop:fruits }}`～`{{ end: }}`
* 繰り返すブロック内では配列要素をワイルドカードを用いたドット記法`(ViewModelのプロパティ).*`で記述します。
   * `animals.*`
   * `fruits.*.name`
   * `fruits.*.age`

`main.js`の変数`html`の内容
```html
<ul>
{{ loop:animals }}
  <li>{{ animals.* }}</li>
{{ end: }}
</ul>
<ul>
{{ loop:fruits }}
  <li>{{ fruits.*.name }}({{ fruits.*.color }})</li>
{{ end: }}
</ul>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  animals = [ "cat", "dog", "fox", "pig" ];
  fruits = [
    { name:"apple", color:"red" },
    { name:"banana", color:"yellow" },
    { name:"grape", color:"grape" },
    { name:"orange", color:"orange" },
    { name:"strawberry", color:"red" },
  ];
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/eYbpzMw)

### Step.8 初期化イベントハンドラ
* `ViewModel`クラスに、初期化イベントハンドラであるコールバックメソッド`$connectedCallback`を設定できます。
* 初期化イベントは、コンポーネント生成時に発生します。
* コールバックメソッドに非同期`async`を指定することができます。
* コールバックメソッドの引数はありません。
* サンプルでは、GitHubのAPIでレポジトリの情報を取得しています。

`main.js`の変数`html`の内容
```html
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  commits = [];
  async $connectedCallback() {
    const response = await fetch("https://api.github.com/repos/mogera551/quel/commits?per_page=3&sha=main");
    this.commits = await response.json();
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/vYvLQVX)

### Step.9 書き込みイベントハンドラ
* `ViewModel`クラスに、書き込みイベントハンドラであるコールバックメソッド`$writeCallback`を設定できます。
* 書き込みイベントは、`ViewModel`のプロパティに書き込みがあった場合に発生します。
* コールバックメソッドに非同期`async`を指定することができます。
* コールバックメソッドの引数には、書き込みしたプロパティ名とインデックス配列が渡されます。
* 通常、入力系DOMに関連付けられた`ViewModel`プロパティは自動的に値を更新されますが、更新後に何か他の処理を行いたいときなどに使用します。
* サンプルでは、GitHubのAPIでレポジトリの情報を取得しています。

`main.js`の変数`html`の内容
```html
<select data-bind="value:per_page">
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
</select>
<ul>
  {{ loop:commits }}
  <li>
    {{ commits.*.sha|slice,0,7 }} - {{ commits.*.message }} by {{ commits.*.commit.author.name }}
  </li>
  {{ end: }}
</ul>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  per_page = "3";
  commits = [];
  async getCommits(per_page) {
    const response = await fetch(`https://api.github.com/repos/mogera551/quel/commits?per_page=${per_page}&sha=main`);
    return await response.json();
  }
  async $connectedCallback() {
    this.commits = await this.getCommits(this.per_page);
  }
  async $writeCallback(name, indexes) {
    if (name === "per_page") {
      // per_pageに変更があったら、取得しなおす
      this.commits = await this.getCommits(this.per_page);
    }
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/rNoxQEE)

### Step.10 デフォルトプロパティ・双方向バインド
* `html`の要素の下表のプロパティをデフォルトプロパティとし、バインド時`html`の要素のプロパティの指定を省略することができます。
   * `data-bind="value:message"`→`data-bind="message"`
   * `data-bind="textContent:message"`→`data-bind="message"` 

|タグ|type属性|プロパティ|
|----|----|----|
|input|radio|checked|
|input|checkbox|checked|
|input|上記以外|value|
|select||value|
|textarea||value|
|上記以外||textContent|

* `html`の入力系要素のデフォルトプロパティと`ViewModel`クラスのプロパティをバインドする場合、入力系DOMのプロパティが更新されると自動的に`ViewModel`クラスのプロパティも更新されます。（双方向バインド）
* 対象となる入力系要素は、`input` `select` `textarea`
* 双方向バインドの場合、出力のためのフィルタは指定しません。必要であれば型変換のための入力フィルタ`number`を指定します。`data-bind="num|number"`
* 入力フィルタの指定方法は、通常のフィルタと同じです。

`main.js`の変数`html`の内容
```html
<div data-bind="message"></div>
<div>
  <input type="text" data-bind="message">
</div>
<div>
  <textarea data-bind="message"></textarea>
</div>
<div>
  <select data-bind="num|number">
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
    <option value="8">8</option>
    <option value="9">9</option>
    <option value="10">10</option>
  </select>
  {{ double }}
</div>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  num = 1;
  message = "";
  get double() {
    return this.num + this.num;
  }
  $dependentProps = {
    "double": ["num"]
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/ZEVWeEP)

### Step.11 スタイルのバインド
* `html`の要素のスタイル属性と`ViewModel`クラスのプロパティをバインドする場合、`style.(要素のスタイル属性名):(ViewModelのプロパティ)`と記述します。→`style.color:numberColor`

`main.js`の変数`html`の内容
```html
<input type="number" data-bind="num|number">
<div data-bind="style.color:numberColor">{{ num }}</div>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  num = 5;
  get numberColor() {
    return this.num > 10 ? "red" : "black";
  }
  $dependentProps = {
    "numberColor": ["num"]
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/mdaEmJx)

### Step.12 クラスのバインド
* `html`の要素のクラス属性と`ViewModel`クラスのプロパティをバインドする場合、`class.(クラス名):(ViewModelのプロパティ)`と記述します。→`class.over:isOver`
* `ViewModel`クラスのプロパティが真の場合、要素のクラス属性にクラス名が追加されます。
* `ViewModel`クラスのプロパティが偽の場合、要素のクラス属性からクラス名が削除されます。

`main.js`の変数`html`の内容
```html
<style>
.over {
  color:red;
}
</style>
<input type="number" data-bind="num|number">
<div data-bind="class.over:isOver">{{ num }}</div>
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  num = 5;
  get isOver() {
    return this.num > 10;
  }
  $dependentProps = {
    "isOver": ["num"]
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/LYMZypL)

### Step.13 繰り返しブロック内のコンテキスト変数・ワイルドカードの使用
* 繰り返しブロック内でワイルドーカードを使ったアクセサプロパティを宣言できます。→`members.*.no` `members.*.isAdult`
* 繰り返しブロック内のワイルドーカードを使ったアクセサプロパティでワイルドーカードを使ったプロパティにアクセスできます。→`members.*.isAdult`内で`members.*.age`を参照している部分。
* 繰り返しブロック内のワイルドーカードを使ったアクセサプロパティでコンテキスト変数（インデックス値）を利用することができます。
  * プロパティ内でコンテキスト変数`this.$1`を参照します。
* 繰り返しブロック内のイベントハンドラでインデックス値を利用することができます。
  * インデックス値はイベントハンドラ第2引数に渡されます。→`popup(e, $1)`の`$1`
* 繰り返しブロック内で直接コンテキスト変数（インデックス値）を利用することができます。→`$1|offset,1`

`main.js`の変数`html`の内容
```html
<style>
.adult {
  color:red;
}
</style>
{{ loop:members }}
<div data-bind="class.adult:members.*.isAdult">
  {{ members.*.no }} = {{ $1|offset,1 }}:{{ members.*.name }}, {{ members.*.age }}
  <button type="button" data-bind="onclick:popup">popup</button>
</div>
{{ end: }}
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  members = [
    { name:"佐藤　一郎", age:20 },
    { name:"鈴木　二郎", age:15 },
    { name:"高橋　三郎", age:22 },
    { name:"田中　四郎", age:18 },
    { name:"伊藤　五郎", age:17 },
  ];
  get "members.*.no"() {
    return this.$1 + 1;
  }
  get "members.*.isAdult"() {
    return this["members.*.age"] >= 18;
  }

  popup(e, $1) {
    alert(`選択したのは、${$1 + 1}行目です`);
  }

  $dependentProps = {
    "members.*.isAdult": [ "members.*.age" ]

    // "members.*.no": [ "$1" ], 
    // コンテキスト変数$1に依存するが、コンテキスト変数$1は記述しなくて良いので、省略
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/rNoLQWY)

### Step.14 配列プロパティの操作
* `ViewModel`の配列プロパティを更新（追加・削除・ソート）する場合、イミュータブルなメソッドで新たな配列を作成し代入します。`add()のconcat`
* `ViewModel`の配列プロパティの要素を更新する場合、ワイルドーカードを使って更新できます。`<input type="text" data-bind="fruits.*">`
   * `html`への反映は自動的に行われます。

`main.js`の変数`html`の内容
```html
<button type="button" data-bind="onclick:add">add grape</button>
<button type="button" data-bind="onclick:dump">dump fruits</button>
{{ loop:fruits }}
<div><input type="text" data-bind="fruits.*">{{ fruits.* }}</div>
{{ end: }}
```

`main.js`の`ViewModel`クラス
```js
class ViewModel {
  fruits = ["apple", "orange", "strawberry"];
  add() {
    // イミュータブルなconcatで要素を追加して、fruitsプロパティへ代入
    // ミュータブルなpushは使わない
    this.fruits = this.fruits.concat("grape");
  }
  dump() {
    alert(JSON.stringify(this.fruits));
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/yLGaNOm)

### Step.15 ToDoリストを作ってみよう
#### 仕様
* チュートリアルの`index.html`を使用する
* 入力部分
   * 入力欄と追加ボタンを用意する
   * 追加ボタンを押すと入力欄の内容をToDoリストに追加し、入力欄をクリア
   * 入力欄に入力がない場合追加ボタンは非活性化`disabled`
* リスト部分
   * `<ul>`でリスト表示する
   * リスト要素毎に、チェックボックス、ToDoの内容、削除ボタンを表示
   * チェックボックスをチェックすると、ToDoの内容を打消し線で装飾
   * 打消し線はクラス属性(`completed`)で実現
   * 削除ボタンを押すと当該行のToDoをリストから削除する
#### `html`のモック
```html
<style>
.completed {
  text-decoration: line-through;
}
</style>
<!-- 入力部分 -->
<div>
  <input type="text">
  <button type="button">追加</button>
</div>
<!-- リスト部分 -->
<ul>
  <li>
    <input type="checkbox">
    <span>ToDoの内容</span>
    <button type="button">削除</button>
  </li>
  <li>
    <input type="checkbox" checked>
    <span class="completed">ToDoの内容</span>
    <button type="button">削除</button>
  </li>
</ul>
```

[モックを見る](https://codepen.io/mogera551/pen/LYMRWVK)

#### ToDo情報を格納するクラス
* ToDoの内容`content`
* 完了フラグ`completed`
```js
class TodoItem {
  content; // ToDoの内容
  completed = false; // 完了フラグ
  constructor(content) {
    this.content = content;
  }
}
```

#### ViewModelクラスで保持する情報
* 入力欄のテキスト`content`
* ToDoリスト(TodoItemのリスト)`todoItems`
   * 配列を保持する場合、初期値として空の配列を入れる
```js
class ViewModel {
  content = ""; // 入力欄のテキスト
  todoItems = []; // ToDoリスト、初期値には空の配列をセットする
}
```

#### htmlの入力部分
* モックの入力部分を元にして作成
* 入力欄と`ViewModel`クラスの`content`をバインド。`data-bind="content"`
* 追加ボタンを押すと`ViewModel`クラスの`add`メソッドを呼び出す。`data-bind="onclick:add"`
* 入力欄に入力がない場合追加ボタンは非活性化`data-bind="disabled:content|falsey"`
   * 追加ボタンの`disabled`プロパティと`ViewModel`クラスの`content|falsey`をバインド
   * `content|falsey`は、`!content`と同じ意味
```html
<div>
  <input type="text" data-bind="content">
  <button type="button" data-bind="onclick:add; disabled:content|falsey">追加</button>
</div>
```

#### ViewModelのaddメソッド
* 入力欄のテキストからToDoリストの要素を生成し、ToDoリストに追加し、ToDoリストを更新
   * ミュータブルな`push`ではなく`concat`を使う
* 追加後、入力欄のテキストをクリア`this.content = ""`
```js
class ViewModel {
  add() {
    this.todoItems = this.todoItems.concat(new TodoItem(this.content));
    this.content = "";
  }
}
```

#### htmlのリスト部分
* モックのリスト部分を元にして作成
* ToDoリストの繰り返すブロックを`{{ loop: }} ～ {{ end: }}`で括る
* チェックボックスのチェック状態とToDoの完了フラグをバインドする。`data-bind="todoItems.*.completed"`
* ToDoの内容の表示`{{ todoItems.*.content }}`
* ToDoの完了フラグの状態によりクラス属性にcompletedを追加、削除する。`data-bind="class.completed:todoItems.*.completed"`
* 削除ボタンを押すと`ViewModel`クラスの`delete`メソッドを呼び出す。`data-bind="onclick:delete"`
```html
<ul>
  {{ loop:todoItems }}
  <li>
    <input type="checkbox" data-bind="todoItems.*.completed">
    <span data-bind="class.completed:todoItems.*.completed">{{ todoItems.*.content }}</span>
    <button type="button" data-bind="onclick:delete">削除</button>
  </li>
  {{ end: }}
</ul>
```

#### ViewModelのdeleteメソッド
* `delete`メソッドは、繰り返しブロック内にあるため、第2引数にインデックスが渡る
* ToDoリストからインデックスの指す要素を削除し、ToDoリストに代入する。
   * ミュータブルな`splice`ではなく`toSpliced`を使う
```js
class ViewModel {
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}
```

#### 完成
`main.js`
```js
const html = `
<style>
  .completed {
    text-decoration: line-through;
  }
</style>
<div>
  <input type="text" data-bind="content">
  <button type="button" data-bind="onclick:add; disabled:content|falsey">追加</button>
</div>
<ul>
  {{ loop:todoItems }}
  <li>
    <input type="checkbox" data-bind="todoItems.*.completed">
    <span data-bind="class.completed:todoItems.*.completed">{{ todoItems.*.content }}</span>
    <button type="button" data-bind="onclick:delete">削除</button>
  </li>
  {{ end: }}
</ul>
`;

class TodoItem {
  content; // ToDoの内容
  completed = false; // 完了フラグ
  constructor(content) {
    this.content = content;
  }
}

class ViewModel {
  content = ""; // 入力欄のテキスト
  todoItems = []; // ToDoリスト、初期値には空の配列をセットする
  add() {
    this.todoItems = this.todoItems.concat(new TodoItem(this.content));
    this.content = "";
  }
  delete(e, $1) {
    this.todoItems = this.todoItems.toSpliced($1, 1);
  }
}
```

[実行結果を見る](https://codepen.io/mogera551/pen/JjwRWYV)

### memo

install @rollup/plugin-terser

```
npm install @rollup/plugin-terser --save-dev
```

bundle

```
npx rollup -c
npx rollup -c rollup-dev.config.js
```

tag
```
git tag v0.9.28 
git push origin --tags
```
