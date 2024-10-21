
// ユースケース
// ステートクラスのプロパティの参照、更新
// プロパティはバインドされず、ダイアログへの入出力を管理する必要がある

// Dialog
class State {
  message = "";
}

// Main
class State {
  message = "";
  popover() {
    const { message } = this;
    try {
      const dialog = this.$component.querySelector("dialog[is=my-dialog]");
      const resutlts = await dialog.asyncShowDialog({ message });
      this.message = results.message;
    } catch(e) {
      // キャンセルの場合
    }
  }
}

<main-app>
  <button data-bind="openDialog"></button>
  <dialog is="my-dialog"></dialog>
</main-app>

///////////////////////////////////////////////////////

// ダイアログ、親コンポーネントのプロパティとバインド
// プロパティはバインドされるが、ダイアログをキャンセルしたときに元に戻す必要がある

// Dialog
class State {
  message = "";
}

// Main
class State {
  message = "";
  async openDialog() {
    const saveMessage = this.message;
    const dialog = this.$component.querySelector("dialog[is=my-dialog]");
    try {
      await dialog.asyncShowModal();
    } catch(e) {
      // キャンセル
      this.message = saveMessage;
    }
  }
}

<main-app>
  <button data-bind="openDialog"></button>
  <dialog is="my-dialog" data-bind="props.message:message"></dialog>
</main-app>

// ダイアログ、親コンポーネントのプロパティとバインド（バッファあり）

// Dialog
class State {
  message = "";
}

// Main
class State {
  message = "";
  openDialog() {
    const dialog = this.$component.querySelector("dialog[is=my-dialog]");
    // dialogでキャンセルの時messageは更新されない
    // 自動化されているのでawaitで待つ必要はない
    dialog.showModal();
  }
}

<main-app>
  <button data-bind="openDialog"></button>
  <dialog is="my-dialog" data-bind="props.message:message" buffered-bind></dialog>
</main-app>

// ダイアログ、親コンポーネントのプロパティとバインド（バッファあり）
// ループコンテキストが異なる場合

// Dialog
class State {
  message = "";
}

// Main
class State {
  messages = [];
  openDialog() {
    const message = this["messages.*"];

    try {

      const dialog = this.$component.querySelector("dialog[is=my-dialog]");
      const results = await dialog.asyncShowModal({message});
      this["messages.*"] = results.message;
    } catch(e) {
      // キャンセルの場合
    }
  }
}

<main-app>
  {{ loop:messages }}
    <button data-bind="openDialog"></button>
  {{ endloop: }}
  <dialog is="my-dialog"></dialog>
</main-app>

// ポップオーバー、プロパティはバインドされず、ポップオーバーへの入出力を管理する必要がある

// Popover
class State {
  message = "";
}

// Main
class State {
  message = "";
  popover() {
    const { message } = this;
    try {
      const resutlts = await dialog.asyncShowPopover({ message });
      this.message = results.message;
    } catch(e) {
      // キャンセルの場合
    }
  }
}

<main-app>
  <button data-bind="popover"></button>
  <my-popover popover><my-popover>
</main-app>

// ポップオーバー、親コンポーネントのプロパティとバインド
// プロパティはバインドされるが、ポップオーバーをキャンセルしたときに元に戻す必要がある

// Popover
class State {
  message = "";
}

// Main
class State {
  message = "";
  async popover() {
    const saveMessage = this,.message;
    const dialog = this.$component.querySelector("my-dialog");
    try {
      await dialog.asyncShowPopover();
    } catch(e) {
      // キャンセル
      this.message = saveMessage;
    }
  }
}

<main-app>
  <button data-bind="openDialog"></button>
  <my-popover data-bind="props.message:message" popover><my-popover>
</main-app>

// ポップオーバー、親コンポーネントのプロパティとバインド（バッファあり）

// Popover
class State {
  message = "";
}

// Main
class State {
  message = "";
  async popover() {
    const dialog = this.$component.querySelector("my-dialog");
    // dialogでキャンセルの時messageは更新されない
    await dialog.asyncShowPopover();
  }
}

<main-app>
  <button data-bind="openDialog"></button>
  <my-popover data-bind="props.message:message" buffered-bind popover><my-popover>
</main-app>

// ポップオーバー、親コンポーネントのプロパティとバインド（バッファあり）
// 自動ポップオーバー、openPopover()が不要

// Popover
class State {
  message = "";
}

// Main
class State {
  message = "";
}

<main-app>
  <button popovertarget="my-popover"></button>
  <my-popover id="my-popover" data-bind="props.message:message" buffered-bind popover><my-popover>
</main-app>

// ポップオーバー、親コンポーネントのプロパティとバインド（バッファあり）
// 自動ポップオーバー、openPopover()が不要、ループコンテキストが異なる場合

// Popover
class State {
  message = "";
}

// Main
class State {
  messages = [];
}

<main-app>
  {{ loop:messages }}
    <button popovertarget="my-popover" data-bind="target.message:messages.*">{{ messages.* }}</button>
  {{ endloop: }}
  <my-popover id="my-popover" buffered-bind popover><my-popover>
</main-app>
