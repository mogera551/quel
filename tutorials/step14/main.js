const html = `
<button type="button" data-bind="onclick:add">add grape</button>
{{ loop:list }}
<div><input type="text" data-bind="list.*">{{ list.* }}</div>
{{ end: }}
`;

class ViewModel {
  list = ["apple", "orange", "strawberry"];
  add() {
    // 非破壊系メソッドconcatで要素を追加して、listプロパティへ代入
    // 破壊系メソッドであるpushは使わない
    this.list = this.list.concat("grape");
  }
}

export default { html, ViewModel }
