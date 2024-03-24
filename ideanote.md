
# ノードプロパティの型変換の自動化

# ポップオーバーAPIへの対応
https://developer.mozilla.org/ja/docs/Web/API/Popover_API
ポップオーバーやダイアログで
* 直接上位のコンポーネントのプロパティを操作する
  →通常のdata-bindでOK
* いったんバッファして正しい場合、上位のコンポーネントのプロパティへ反映させる
  →表示時にpropsをローカル用に生成
  →消去時に結果が正しければpropsの内容を上位のコンポーネントのプロパティへ反映
  →ポップオーバー、ダイアログで対応が異なるので注意

# カスタムコンポーネントのオプションを属性で上書きできるようにする
* data-web-component
* data-shadow-root
* data-local-tag-name
* data-keyed
* data-buffered-bind

# <details>: 詳細折りたたみ要素への対応
https://developer.mozilla.org/ja/docs/Web/HTML/Element/details

# validationへの対応

# form submitの推奨される実装