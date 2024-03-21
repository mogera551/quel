
# ノードプロパティの型変換の自動化

# ダイアログタグへの対応
   * connected後のバインド
```
Dialog.open = async function (tagName, {}) {
  
}

<dialog is="custom-dialog" id="custom-dialog"></dialog>

const dialog = document.querySelector("#custom-dialog");


dialog.binding();
dialog.show();
dialog.showModal();

dialog.popup(パラメータ, modal).then(result => {

});

```

# ポップオーバーAPIへの対応
