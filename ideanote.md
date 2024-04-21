
# ノードプロパティの型変換の自動化

# 外部コンポーネントとして使用する
const memberList = document.createElement("member-list");
memberList.props.members = members;
body.appendChild(memberList);


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

