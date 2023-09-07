const html = `
<button type="button" data-bind="onclick:add">add grape</button>
{{ loop:fruits }}
<div><input type="text" data-bind="fruits.*">{{ fruits.* }}</div>
{{ end: }}
`;

class ViewModel {
  fruits = ["apple", "orange", "strawberry"];
  add() {
    // 非破壊系メソッドconcatで要素を追加して、fruitsプロパティへ代入
    // 破壊系メソッドであるpushは使わない
    this.fruits = this.fruits.concat("grape");
  }
}

export default { html, ViewModel }
