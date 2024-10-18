
// ユースケース
// ステートクラスのプロパティの参照、更新

class State {
  message = "";
}

<main-app></main-app>

const component = document.querySelector("main-app");

alert(component.props.message);
component.props.message = "message is cahnged";

///////////////////////////////////////////////////////

class State {
  message = "";
}

<my-dialog></my-dialog>

const dialog = document.querySelector("my-dialog");

const {message} = await dialog.asyncShow({message: "this is dialog"});

///////////////////////////////////////////////////////

// ダイアログ、親コンポーネントのプロパティとバインド

class State {
  message = "";
}

class State {
  message = "";
  async openDialog() {
    const dialog = this.$component.querySelector("my-dialog");
    await dialog.asyncShowModal();
  }
}

<main-app>
  <my-dialog data-bind="props.message:message"></my-dialog>
</main-app>

// ダイアログ、親コンポーネントのプロパティとバインド（バッファあり）

class State {
  message = "";
}

class State {
  message = "";
  openDialog() {

  }
}

<main-app>
  <my-dialog data-bind="props.message:message" buffered-bind></my-dialog>
</main-app>
