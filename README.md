
# Quelって何？
簡単に使えるJavaScriptフレームワークです。

## 主な特徴
* ルール、作法を少なく、なるべく直感的に
* 宣言的なUIの記述
* 他のライブラリ不要
* トランスパイル不要
* コンポーネントベース
* ドット記法によるプロパティ記述ができる！！！

## はじめよう
Quelを使うには、import宣言で、CDNもしくはダウンロードしたファイルから読み込みます。
※import宣言をするので、scriptタグには、`type="module"`が必要です。

CDNの例
```html
<script type="module">
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN
</script>
```

ファイルの例
```html
<script type="module">
import quel from "./path/to/quel.min.js"; // ファイル
</script>
```

### 簡単なテスト
`Welcome to Quel`と画面に表示されます。

```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN

const html = `
<div>{{ message }}</div>
`;

class ViewModel {
  message = "Welcome to Quel";
}

quel.componentModules({ myappMain:{ html, ViewModel } });
</script>
</html>
```

## 開発の流れ
コンポーネントベースの開発になります。
* カスタム要素をHTMLに記述
* 対応するコンポーネントモジュールの作成
   * テンプレートとなるHTMLを定義
   * 状態を保存、操作するクラスを定義
* カスタム要素とコンポーネントモジュールを対応付ける

### カスタム要素をHTMLに記述
カスタム要素は自律カスタム要素(autonomous custom element)、
カスタマイズドビルトイン要素(customized built-in element)が利用できます。
カスタム要素名には、ダッシュ`-`を含める必要があります。
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<!-- 自律カスタム要素(autonomous custom element) -->
<myapp-main><myapp-main>

<!-- カスタマイズドビルトイン要素(customized built-in element) -->
<div is="myapp-sub"></div>

<script type="module">
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN
</script>

</html>
```

### 対応するコンポーネントモジュールの作成
コンポーネントモジュールは、テンプレートのHTMLと、状態を保存、操作するクラスで構成されます。
１つのコンポーネントモジュールは、１つのファイルに記述したほうが管理しやすいです。

#### テンプレートとなるHTMLを定義
コンポーネントで使用するDOMのテンプレートとなるHTMLを定義します。
埋め込み、DOM要素の属性値の関連付け、イベントの関連付け、条件分岐、繰り返しを記述できます。
`html`という変数名で宣言すると、`export`するときに便利です。
```js
const html = `
<!-- 埋め込み -->
<div>{{ count }}</div>

<!-- DOM要素の属性値の関連付け -->
<input data-bind="name">

<!-- イベントの関連付け -->
<button data-bind="onclick:countUp">countUp</button>

<!-- 条件分岐 -->
{{ if:disp }}
  <div>5回以上押されたよ</div>
{{ end: }}

<!-- 繰り返し -->
<ul>
  {{ loop:animals }}
    <li>{{ animals.* }}</li>
  {{ end: }}
</ul>
`;
```

#### 状態を保存、操作するクラスを定義
コンポーネントの状態を保存、操作するクラスを定義します。
状態を保存するメンバをクラスの中でフィールド宣言します。
状態を操作するメソッドをクラスの中に作成します。
`ViewModel`というクラス名で宣言すると、`export`するときに便利です。
getterを使った、アクセサプロパティを利用することもできます。
※アクセサプロパティを使う場合、依存関係の定義をすることが必要です。
```js
class ViewModel {
  /* 状態の保存 */
  count = 0;
  name = "John Smith";
  animals = [ "Cat", "Dog", "Rabit" ];
  // getterを使った、アクセサプロパティ
  get disp() {
    return this.count >= 5;
  }

  /* 状態を操作するメソッド */
  countUp() {
    this.count++;
  }

  /* 依存関係を定義 */
  #dependentProps = {
    "disp": [ "count" ],
  }
}
```

#### エクスポート
コンポーネントモジュールを１つのファイルに記述する場合、`export`します。
カスタマイズドビルトイン要素の場合、拡張するタグ`extendTag`の指定が必要になります。

```js
// コンポーネントモジュールのexport
export default { html, ViewModel };

// カスタマイズドビルトイン要素の場合、拡張するタグ(extendTag)の指定が必要
export default { html, ViewModel, extendTag:"div" };
```
### カスタム要素とコンポーネントモジュールを対応付ける
作成したコンポーネントモジュールを`import`する。
コンポーネントモジュールとカスタム要素名と対応付ける。

```js
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN
// コンポーネントモジュールのimport
import myappMain from "./main.js";

// カスタム要素名とコンポーネントモジュールと対応付ける。
quel.componentModules({ "myapp-main":myappMain });

// カスタム要素名はキャメルケースでも大丈夫。
quel.componentModules({ "myappMain":myappMain });

// オブジェクトリテラルの省略記法でより簡単に記述できます。
quel.componentModules({ myappMain });
```

## チュートリアル
### 前提
チュートリアルで使うファイル構成は、
```
--+-- index.html
  |
  +-- main.js
```
とします。  

`index.html`は、  
* カスタム要素(`<myapp-main/>`)の記述
* quelの`import`
* `main`コンポーネントモジュールの`import`
* コンポーネントモジュールとカスタム要素名と対応付け

を行います。  
断りがなければ、チュートリアルでは、下記の`index.html`の内容を使用することとします。

`index.html`の内容
```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script>
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN
import myappMain from "./main.js";

quel.componentModules({ myappMain });
</script>
</html>
```

`main.js`は、
* `html`変数で、テンプレートとなるHTMLを定義
* `ViewModel`クラスで、状態を保存、操作するクラスを定義
* コンポーネントモジュールを`export`

します。  
チュートリアルでは、主に`main.js`について述べます。

`main.js`の内容
```js
const html = `
(テンプレートとなるHTMLの内容)
`;

class ViewModel {
  // (状態を保存)

  // (状態を操作する)

}

export default { html, ViewModel };
```

### Step.1 プロパティの埋め込み
* `html`で、埋め込むプロパティ`message`を`{{ }}`で括る。→ `{{ message }}`
* `ViewModel`クラスで、状態保存するプロパティ`message`をフィールド宣言し、初期値`welcome to quel`を与える。

main.jsのソース
```js
const html = `
<div>{{ message }}</div>
`;

class ViewModel {
  message = "welcome to quel";
}

export default { html, ViewModel }
```

`<myapp-main/>`の結果
```html
<myapp-main>
  <div>welcome to quel</div>
<myapp-main>
```

### Step.2 プロパティのバインド
* `html`のDOM要素のプロパティと`ViewModel`クラスのプロパティを関連付ける（バインドする）
* DOM要素の`data-bind`属性に`(DOM要素のプロパティ名):(ViewModelクラスのプロパティ名)`と指定する
* 入力系DOM要素の場合、インタラクティブに`ViewModel`クラスのプロパティは更新される

main.jsのソース
```js
const html = `
<div>{{ message }}</div>
<input type="text" data-bind="value:message">
`;

class ViewModel {
  message = "welcome to quel";
}

export default { html, ViewModel }
```

<iframe height="300" style="width: 100%;" scrolling="no" title="Welcome to Quel" src="https://codepen.io/mogera551/embed/KKrbPjJ?default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/mogera551/pen/KKrbPjJ">
  Welcome to Quel</a> by mogera551 (<a href="https://codepen.io/mogera551">@mogera551</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### memo

bundle

```
npx rollup -c
npx rollup -c rollup.config.dev.js
```

