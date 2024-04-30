# はじめに
* チュートリアルで使用するファイルの構成
* `index.html`の役割
  * html
    * コンポーネントのタグ
  * java script
    * quelのインポート
    * コンポーネントのインポート
    * コンポーネントとタグの関連付け
* `main.js`の役割
  * コンポーネントの定義
    * Viewの定義(html変数)とエクスポート
    * ViewModelの定義(ViewModelクラス)とエクスポート
  * optionの定義とエクスポート
  * configの定義とエクスポート

# Step 1.
* Viewの変数の埋め込み方
* ViewModelクラスの変数の定義の仕方

# Step 2.
* ViewのHTML要素のプロパティとViewModelクラスの変数のバインド
* バインドする要素の`data-bind`属性にバインド情報を記述する
* バインド情報の記述の仕方、HTML要素のプロパティ名とViewModelクラスの変数名をコロンで区切る。
  * `[HTML要素のプロパティ名]:[ViewModelクラスの変数名]`

# Step 3.
* ViewのHTML要素のイベントハンドラとViewModelクラスのメソッドのバインド
