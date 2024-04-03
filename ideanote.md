
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
$bufferCreate(component) {
  const { xxxx, yyyy } = this;
  return { xxxx, yyyy };
}
```
* バッファ書き出し、ループコンテキストが使用できる
```
$bufferWriteback(component, buffer) {
  const { xxxx, yyyy } = buffer;
  Object.assign(this, { xxxx, yyyy });
}
```

example 
  dialog

```
const html = `
<div>{{ name }}</div>
<div>{{ email }}</div>
<button data-bind="openDialog">edit</button>
<dialog is="member-edit" id="member-edit"></dialog>
`;

class ViewModel {
  name;
  email;
  async openDialog() {
    try {
      const dialog = this.$component.querySelector("#member-edit");
      const { name, email } = this;
      Object.assign(this, await dialog.asyncShowModal({ name, email }));
    } catch(e) {
      // cancel
    }

  }
}


```


```
onopenclick() {
  const dialog = this.$component.querySelector("detail-dialog");
  dialog.showModal();
  const {xxxx, yyyy} = this;
  dialog.props = {xxxx, yyyy};
}

onopenclick() {
  const dialog = this.$component.querySelector("detail-dialog");
  const {xxxx, yyyy} = this;

  try {
    const buffer = await dialog.asyncShowModal({xxxx, yyyy});
    Object.assign(this, buffer);
  } catch(e) {
    // cancel
  }
}

onclose(e) {
  const {xxxx, yyyy} = e.target.props;
  Object.assign(this, {xxxx, yyyy});
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