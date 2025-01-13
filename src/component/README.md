

# Dialog
* data-bind属性での連携
```html
<script>
export class State {
  name;
  showDialog() {
    const dialog = document.querySelector("#myapp-dialog", this.$component.quelQueryRoot);
    dialog.show();
  }

}
</script>
<button data-bind="showDialog">show dialog</button>

<dialog is="myapp-dialog" id="myapp-dialog" data-bind="props.name:name">
</dialog>
```

```html
<script>
export class State {
  name;
  close() {
    this.$component.close();
  }

}
</script>

<form method="dialog">
  <input type="text" data-bind="name">
  <button type="button" data-bind="onclick:close">close</button>
</form>
```
* data-bind属性での連携(バッファ)
```html
<script>
export class State {
  name;
  showDialog() {
    const dialog = document.querySelector("#myapp-dialog", this.$component.quelQueryRoot);
    dialog.show();
  }

}
</script>
<button data-bind="showDialog">show dialog</button>

<dialog is="myapp-dialog" id="myapp-dialog" data-bind="props.name:name" buffered-bind>
</dialog>
```

```html
<script>
export class State {
  name;
  submit() {
    this.$submit();
  }
  cancel() {
    this.$component.close();
  }

}
</script>

<form method="dialog" data-bind="submit">
  <input type="text" data-bind="name">
  <button type="submit" value="ok">OK</button>
  <button type="button" data-bind="onclick:cancel">cancel</button>
</form>
```


* コード実装(同期)
```html
<button type="button" data-bind="showDialog">show dialog</button>
<dialog is="myapp-dialog" id="myapp-dialog" data-bind="onclose:closeDialog">
</dialog>

<script type="module">
export class State {
  name;
  showDialog() {
    const dialog = document.querySelector("#myapp-dialog", this.$component.quelQueryRoot);
    dialog.props.name = this.name;
    dialog.showModal();
  }
  closeDialog(event) {
    const dialog = event.target;
    if (dialog.returnValue === "") return;
    const { name } = dialog.quelProps;
    this.name = name;

  }

}
</script>
```

* コード実装(非同期)
```html
<button type="button" data-bind="showDialog">show dialog</button>
<dialog is="myapp-dialog" id="myapp-dialog">
</dialog>

<script type="module">
export class State {
  name;
  async showDialog() {
    const dialog = document.querySelector("#myapp-dialog", this.$component.quelQueryRoot)
    const results = await dialog.show(this, true);
    this.name = results?.name ?? this.name;
  }
}
</script>
```

# Popover
* data-bind属性での連携
```html
<script>
export class State {
  name;
  popover() {
    const popover = document.querySelector("#myapp-popover", this.$component.quelQueryRoot);
    popover.showPopover();
  }

}
</script>
<button data-bind="popover">popover</button>

<myapp-popover id="myapp-popover" data-bind="props.name:name">
</myapp-popover>
```

```html
<script>
export class State {
  name;
  close() {
    this.$component.hidePopover();
  }

}
</script>

<input type="text" data-bind="name">
<button type="button" data-bind="onclick:close">close</button>
```

* data-bind属性での連携(バッファ)
```html
<script>
export class State {
  name;
  popover() {
    const popover = document.querySelector("#myapp-popover", this.$component.quelQueryRoot);
    popover.showPopover();
  }

}
</script>
<button data-bind="popover">popover</button>

<myapp-popover id="myapp-popover" data-bind="props.name:name" buffered-bind>
</myapp-popover>
```

```html
<script>
export class State {
  name;
  submit() {
    this.$submit();
    this.$component.hidePopover();
  }
  cancel() {
    this.$component.hidePopover();
  }

}
</script>

<form method="dialog" data-bind="onsumit|pd:submit">
  <input type="text" data-bind="name">
  <button type="submit" value="ok">OK</button>
  <button type="button" data-bind="onclick:cancel">cancel</button>
</form>
```
