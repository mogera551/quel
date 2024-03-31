
# ノードプロパティの型変換の自動化

# ダイアログ、ポップオーバーAPIへの対応
https://developer.mozilla.org/ja/docs/Web/API/Popover_API
ポップオーバーやダイアログで
* 直接上位のコンポーネントのプロパティを操作する
  →通常のdata-bindでOK
* いったんバッファして正しい場合、上位のコンポーネントのプロパティへ反映させる
  →表示時にpropsをローカル用に生成
  →消去時に結果が正しければpropsの内容を上位のコンポーネントのプロパティへ反映
  →ポップオーバー、ダイアログで対応が異なるので注意
* バッファ開始、ループコンテキストが使用できる
```
$bufferCreate(component, binds) {
  const buffer = {};
  buffer.xxxx = this.xxxx;
  buffer.yyyy = this.yyyy;
  return buffer;
}
```
* バッファ書き出し、ループコンテキストが使用できる
```
$bufferWriteback(component, buffer) {
  this.xxxx = buffer.xxxx;
  this.yyyy = buffer.yyyy;
}
```

# カスタムコンポーネントのオプションを属性で上書きできるようにする
* [web-component], no-web-component
* shadow-root, [no-shadow-root]
* [local-tag-name], no-local-tag-name
* [keyed], no-keyed
* buffered-bind, [no-buffered-bind]

# 外部からpropsプロパティでViewModelへアクセスできるようにする
* propsプロパティの意味を変更する
   * 現在は、上位コンポーネントとのバインドのための中継みたいな位置づけ
   * viewmodelへアクセスするためのインターフェースとする
   * propsへの代入は、viewModelへのシャロウコピー？

# <details>: 詳細折りたたみ要素への対応
https://developer.mozilla.org/ja/docs/Web/HTML/Element/details

# validationへの対応

# form submitの推奨される実装