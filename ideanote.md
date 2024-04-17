
# ノードプロパティの型変換の自動化

# validationへの対応
https://developer.mozilla.org/ja/docs/Learn/Forms/Form_validation

# <details>: 詳細折りたたみ要素への対応
https://developer.mozilla.org/ja/docs/Web/HTML/Element/details

# form submitの推奨される実装

# イベントフィルター
ex.
<button data-bind="onclick:countUp|preventDefault|stopPropagation">count up</button>
or
<button data-bind="onclick:countUp|pd|sp">count up</button>

sp(eventfilter) {
  eventfilter.e.stopPropagation();
  eventfilter.next();
}

pd(eventfilter) {
  eventfilter.e.preventDefault();
  eventfilter.next();
}

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
